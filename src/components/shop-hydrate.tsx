import { useEffect } from "react";
import { buildSeedBookings } from "@/lib/shop/seed";
import { useShop } from "@/lib/shop/store";

export function ShopHydrate() {
  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        await useShop.persist.rehydrate();
      } catch {
        /* keep the in-memory shop */
      }
      if (cancel) return;
      const state = useShop.getState();
      if (!state.initialized) {
        useShop.setState({
          bookings: buildSeedBookings(new Date()),
          initialized: true,
          hydrated: true,
        });
      } else {
        useShop.setState({ hydrated: true });
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
  return null;
}
