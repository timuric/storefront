import { PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection/PaymentSectionSkeleton";
import { useCheckoutUpdateState } from "@/checkout/state/updateStateStore";
import { PlaceUnpaidOrder } from "@/checkout/sections/PaymentSection/Demo/PaymentOptions";

export const PaymentMethods = () => {
	const {
		changingBillingCountry,
		updateState: { checkoutDeliveryMethodUpdate },
	} = useCheckoutUpdateState();

	// delivery methods change total price so we want to wait until the change is done
	if (changingBillingCountry || checkoutDeliveryMethodUpdate === "loading") {
		return <PaymentSectionSkeleton />;
	}

	return (
		<div className="gap-y-8">
			<PlaceUnpaidOrder />
		</div>
	);
};
