import AsyncStorage from "@react-native-async-storage/async-storage";

export const PROFILE_AVATAR_KEY = "wm_profile_avatar";

export async function getProfileAvatar(): Promise<string | null> {
  try { return await AsyncStorage.getItem(PROFILE_AVATAR_KEY); } catch { return null; }
}

export async function setProfileAvatar(uri: string): Promise<void> {
  try { await AsyncStorage.setItem(PROFILE_AVATAR_KEY, uri); } catch { /* local preference only */ }
}

export async function clearProfileAvatar(): Promise<void> {
  try { await AsyncStorage.removeItem(PROFILE_AVATAR_KEY); } catch { /* local preference only */ }
}
