import React, { type FormEventHandler, useState } from "react";
import { useCheckoutValidationActions } from "@/checkout/state/checkoutValidationStateStore";
import { useUser } from "@/checkout/hooks/useUser";
import { useCheckoutUpdateStateActions } from "@/checkout/state/updateStateStore";
import { useEvent } from "@/checkout/hooks/useEvent";
import { type CheckoutError, useCheckoutCompleteMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { replaceUrl } from "@/checkout/lib/utils/url";
import { Button } from "@/checkout/components";
import { Loader } from "@/ui/atoms/Loader";

const DisplayError = ({ errors, channel }: { errors: CheckoutError[] | null; channel: string }) => {
	if (!errors?.length) {
		return null;
	}

	const hasNotFullyPaid = errors.find((error) => error.code === "CHECKOUT_NOT_FULLY_PAID");

	if (hasNotFullyPaid) {
		const link = process.env.NEXT_PUBLIC_SALEOR_API_URL?.replace(
			"/graphql",
			`/dashboard/channels/${channel}`,
		);
		return (
			<div className={"mb-6 flex flex-col gap-4 rounded-xl bg-amber-200 p-4"}>
				<div>
					<span className={"mb-1 rounded-3xl bg-amber-600 px-2 text-xs text-white"}>Error</span>
					This channel requires payments to be made before placing orders. If you are just experimenting with
					a sandbox and want to test placing unpaid orders, <strong>enable</strong>{" "}
					<strong>"Allow unpaid orders"</strong> in the{" "}
					{link ? (
						<a href={link} className={"text-blue-600"} target={"_blank"}>
							Channel settings.
						</a>
					) : (
						"Channel settings."
					)}
				</div>
			</div>
		);
	} else {
		return (
			<div>
				Something went wrong:
				<div className={"mb-4 flex flex-col items-start"}>
					{errors.map((error) => (
						<span className={"my-2 justify-self-start rounded-xl bg-amber-200 px-2 py-1"} key={error.code}>
							{error.message}
						</span>
					))}
				</div>
			</div>
		);
	}
};

export const DemoPayment = () => {
	const { checkout } = useCheckout();
	const { authenticated } = useUser();
	const { validateAllForms } = useCheckoutValidationActions();
	const { setSubmitInProgress, setShouldRegisterUser } = useCheckoutUpdateStateActions();
	const [_, completeMutation] = useCheckoutCompleteMutation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [errors, setErrors] = useState<CheckoutError[] | null>(null);
	const onSubmit: FormEventHandler<HTMLFormElement> = useEvent(async (e) => {
		setErrors(null);
		setIsSubmitting(true);
		e.preventDefault();
		validateAllForms(authenticated);
		setShouldRegisterUser(true);
		setSubmitInProgress(true);

		const { data } = await completeMutation({
			checkoutId: checkout.id,
		});

		const order = data?.checkoutComplete?.order;
		const errors = data?.checkoutComplete?.errors;

		if (order) {
			const newUrl = replaceUrl({
				query: {
					order: order.id,
				},
				replaceWholeQuery: true,
			});
			window.location.href = newUrl;
		} else if (errors) {
			setErrors(() => [...errors]);
		}

		setIsSubmitting(false);
	});

	return (
		<form onSubmit={onSubmit}>
			<DisplayError errors={errors} channel={checkout?.channel.id} />
			<div className={"mb-6"}>
				<button type={"submit"}>{isSubmitting ? <Loader /> : <Button label={"Place Order"} />}</button>
			</div>
		</form>
	);
};
