import { Suspense } from "react";
import CheckoutComponent from "./CheckOutPage";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutComponent />
    </Suspense>
  );
}
