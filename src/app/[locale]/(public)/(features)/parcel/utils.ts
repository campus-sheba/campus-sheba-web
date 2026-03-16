import { useRouter } from "next/navigation";

export function useParcelNavigation() {
    const router = useRouter();
    function goToParcel(id: string) {
        router.push(`/parcel/${id}`);
    }
    return { goToParcel };
}
