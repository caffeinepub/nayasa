import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { SellProvider } from "./context/SellContext";
import { useActor } from "./hooks/useActor";
import { AdminPanel } from "./pages/AdminPanel";
import { Checkout } from "./pages/Checkout";
import { Diagnose } from "./pages/Diagnose";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { PaymentFailure } from "./pages/PaymentFailure";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { ProductDetail } from "./pages/ProductDetail";
import { ProfileSetup } from "./pages/ProfileSetup";
import { Quote } from "./pages/Quote";
import { Sell } from "./pages/Sell";
import { Signup } from "./pages/Signup";

function AppLayout() {
  const { actor } = useActor();

  useEffect(() => {
    if (actor) {
      actor.initialize().catch(console.error);
    }
  }, [actor]);

  return (
    <SellProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </SellProvider>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const listingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$id",
  component: ProductDetail,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/$id",
  component: Checkout,
});

const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell",
  component: Sell,
});

const diagnoseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell/diagnose",
  component: Diagnose,
});

const quoteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell/quote",
  component: Quote,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Signup,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile-setup",
  component: ProfileSetup,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  listingRoute,
  checkoutRoute,
  sellRoute,
  diagnoseRoute,
  quoteRoute,
  loginRoute,
  signupRoute,
  profileSetupRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
