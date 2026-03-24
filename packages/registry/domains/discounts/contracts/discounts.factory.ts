import type { IPromotionRepository } from "../application/ports/promotion-repository.port.js";
import type { ICouponRepository } from "../application/ports/coupon-repository.port.js";
import { CreatePromotion } from "../application/use-cases/create-promotion.use-case.js";
import { ActivatePromotion } from "../application/use-cases/activate-promotion.use-case.js";
import { DeactivatePromotion } from "../application/use-cases/deactivate-promotion.use-case.js";
import { GetPromotion } from "../application/use-cases/get-promotion.use-case.js";
import { ListPromotions } from "../application/use-cases/list-promotions.use-case.js";
import { CreateCoupon } from "../application/use-cases/create-coupon.use-case.js";
import { ValidateCoupon } from "../application/use-cases/validate-coupon.use-case.js";
import { RedeemCoupon } from "../application/use-cases/redeem-coupon.use-case.js";
import { ApplyDiscount } from "../application/use-cases/apply-discount.use-case.js";
import type { IDiscountsService } from "./discounts.contract.js";

export type DiscountsServiceDeps = {
  promotionRepository: IPromotionRepository;
  couponRepository: ICouponRepository;
};

export function createDiscountsService(deps: DiscountsServiceDeps): IDiscountsService {
  const createPromotion = new CreatePromotion(deps.promotionRepository);
  const activatePromotion = new ActivatePromotion(deps.promotionRepository);
  const deactivatePromotion = new DeactivatePromotion(deps.promotionRepository);
  const getPromotion = new GetPromotion(deps.promotionRepository);
  const listPromotions = new ListPromotions(deps.promotionRepository);
  const createCoupon = new CreateCoupon(deps.couponRepository, deps.promotionRepository);
  const validateCoupon = new ValidateCoupon(deps.couponRepository, deps.promotionRepository);
  const redeemCoupon = new RedeemCoupon(deps.couponRepository, deps.promotionRepository);
  const applyDiscount = new ApplyDiscount(deps.promotionRepository, deps.couponRepository);

  return {
    createPromotion: (input) => createPromotion.execute(input),
    activatePromotion: (id) => activatePromotion.execute(id),
    deactivatePromotion: (id) => deactivatePromotion.execute(id),
    getPromotion: (id) => getPromotion.execute(id),
    listPromotions: (filter) => listPromotions.execute(filter),
    createCoupon: (input) => createCoupon.execute(input),
    validateCoupon: (code) => validateCoupon.execute(code),
    redeemCoupon: (input) => redeemCoupon.execute(input),
    applyDiscount: (input) => applyDiscount.execute(input),
  };
}
