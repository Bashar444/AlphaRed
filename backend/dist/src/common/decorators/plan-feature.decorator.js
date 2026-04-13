"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanFeature = exports.PLAN_FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PLAN_FEATURE_KEY = 'plan_feature';
const PlanFeature = (feature) => (0, common_1.SetMetadata)(exports.PLAN_FEATURE_KEY, feature);
exports.PlanFeature = PlanFeature;
//# sourceMappingURL=plan-feature.decorator.js.map