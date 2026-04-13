import { SetMetadata } from '@nestjs/common';

export const PLAN_FEATURE_KEY = 'plan_feature';
export const PlanFeature = (feature: string) =>
    SetMetadata(PLAN_FEATURE_KEY, feature);
