import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateBusinessAPI } from "../api/business.api";
import { useAuthContext } from "../context/AuthContext";

export const useUpdateBusiness = () => {
  const { refreshUser } = useAuthContext();

  const mutation = useMutation({
    mutationFn: updateBusinessAPI,
    onSuccess: async () => {
      await refreshUser();
      toast.success("Business profile updated");
    },
  });

  return {
    updateBusiness: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error:
      mutation.error?.response?.data?.message || mutation.error?.message || null,
  };
};
