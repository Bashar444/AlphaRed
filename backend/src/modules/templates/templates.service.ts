import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SURVEY_TEMPLATES, SurveyTemplate } from './templates.data';

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) {}

    list(category?: string): Array<Omit<SurveyTemplate, 'questions'> & { questionCount: number }> {
        const filtered = category
            ? SURVEY_TEMPLATES.filter((t) => t.category.toLowerCase() === category.toLowerCase())
            : SURVEY_TEMPLATES;
        return filtered.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            estimatedMinutes: t.estimatedMinutes,
            tags: t.tags,
            icon: t.icon,
            questionCount: t.questions.length,
        }));
    }

    categories(): string[] {
        return Array.from(new Set(SURVEY_TEMPLATES.map((t) => t.category))).sort();
    }

    getById(id: string): SurveyTemplate {
        const tpl = SURVEY_TEMPLATES.find((t) => t.id === id);
        if (!tpl) throw new NotFoundException('Template not found');
        return tpl;
    }

    async instantiate(templateId: string, userId: string) {
        const tpl = this.getById(templateId);

        // Plan-limit guard (mirrors SurveysService.assertCanCreateSurvey)
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        let plan = sub?.plan;
        if (!plan || !sub || !['ACTIVE', 'TRIALING'].includes(sub.status)) {
            plan = (await this.prisma.plan.findFirst({ where: { slug: 'free' } })) ?? undefined;
        }
        const maxSurveys = plan?.maxSurveys ?? 1;
        const maxQuestions = plan?.maxQuestions ?? 10;
        if (maxSurveys > 0) {
            const used = await this.prisma.survey.count({
                where: { userId, status: { not: 'ARCHIVED' } },
            });
            if (used >= maxSurveys) {
                throw new ForbiddenException(
                    `Plan limit reached: ${maxSurveys} survey(s). Upgrade to use templates.`,
                );
            }
        }
        if (maxQuestions > 0 && tpl.questions.length > maxQuestions) {
            throw new ForbiddenException(
                `This template has ${tpl.questions.length} questions but your plan allows ${maxQuestions}. Upgrade to use it.`,
            );
        }

        const survey = await this.prisma.survey.create({
            data: {
                userId,
                title: tpl.title,
                description: tpl.description,
                status: 'DRAFT',
                estimatedMinutes: tpl.estimatedMinutes,
                category: tpl.category,
                tags: tpl.tags,
                questions: {
                    create: tpl.questions.map((q, idx) => ({
                        order: idx + 1,
                        type: q.type as any,
                        text: q.text,
                        description: q.description,
                        required: q.required ?? true,
                        options: (q.options ?? null) as any,
                        validation: (q.validation ?? null) as any,
                    })),
                },
            },
            include: { questions: true },
        });
        return survey;
    }
}
