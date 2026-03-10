import { useQuery } from "@tanstack/react-query";
import type { PhoneListing } from "../backend";
import { useActor } from "./useActor";

export function useAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<PhoneListing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useListingsByBrand(brand: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PhoneListing[]>({
    queryKey: ["listings", "brand", brand],
    queryFn: async () => {
      if (!actor) return [];
      if (brand === "All") return actor.getAllListings();
      return actor.getListingsByBrand(brand);
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useListingById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<PhoneListing>({
    queryKey: ["listing", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getListingById(id);
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}
