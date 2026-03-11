import { create } from "zustand";
import { User } from "@/types";
import { users, currentUser } from "@/data/seed";

interface UserStore {
  users: User[];
  currentUser: User;
  getUserById: (id: string) => User | undefined;
  getUsersByIds: (ids: string[]) => User[];
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: users,
  currentUser: currentUser,
  getUserById: (id) => get().users.find((u) => u.id === id),
  getUsersByIds: (ids) => get().users.filter((u) => ids.includes(u.id)),
}));
