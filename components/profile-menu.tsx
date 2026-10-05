import { useEffect, useState } from "react";
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { getProfileAvatar, setProfileAvatar } from "@/lib/profile";

const SUPPORT_NUMBER = "201095314107";

type ProfileMenuProps = { compact?: boolean };

export function ProfileMenu({ compact = false }: ProfileMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuth({ autoFetch: true });
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const displayName = user?.name || "عميل wm";
  const initial = displayName.slice(0, 1).toUpperCase();

  useEffect(() => { getProfileAvatar().then(setAvatar); }, []);

  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled || !result.assets[0]?.uri) return;
    const uri = result.assets[0].uri;
    setAvatar(uri);
    await setProfileAvatar(uri);
  };

  const close = () => setVisible(false);
  const openSettings = () => { close(); router.push("/(tabs)/settings"); };
  const openAdmin = () => { close(); router.push("/admin"); };
  const support = () => { close(); Linking.openURL(`https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent("مرحباً wm، أحتاج مساعدة")}`); };
  const signOut = async () => { setBusy(true); await logout(); setBusy(false); close(); router.replace("/login"); };

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.avatarButton, compact && styles.compactAvatar, { opacity: pressed ? 0.75 : 1 }]} accessibilityLabel="فتح قائمة الحساب">
        {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Text style={styles.avatarInitial}>{initial}</Text>}
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={styles.dismiss} onPress={close} />
          <View style={styles.drawer}>
            <View style={styles.drawerTop}><View style={styles.drawerBrand}><Text style={styles.drawerBrandText}>wm</Text><View style={styles.drawerDot} /></View><Pressable onPress={close} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
            <View style={styles.userRow}>
              <Pressable onPress={chooseAvatar} style={styles.largeAvatar}>{avatar ? <Image source={{ uri: avatar }} style={styles.largeAvatarImage} /> : <Text style={styles.largeAvatarText}>{initial}</Text>}<View style={styles.cameraBadge}><Text style={styles.cameraText}>＋</Text></View></Pressable>
              <View style={styles.userCopy}><Text style={styles.userName}>{displayName}</Text><Text style={styles.userEmail}>{user?.email || "حساب wm"}</Text><Text style={styles.changePhoto}>اضغط الصورة لتغييرها</Text></View>
            </View>
            <View style={styles.menuList}>
              <MenuItem icon="◉" label="حسابي" onPress={openSettings} />
              <MenuItem icon="◐" label="إعدادات الواجهة" onPress={openSettings} />
              <MenuItem icon="◆" label="للإدارة فقط" onPress={openAdmin} />
              <MenuItem icon="◌" label="تواصل مع الدعم" onPress={support} />
              <MenuItem icon="?" label="الاستفسار والمساعدة" onPress={support} />
            </View>
            <Pressable onPress={signOut} disabled={busy} style={({ pressed }) => [styles.logout, { opacity: pressed || busy ? 0.6 : 1 }]}><Text style={styles.logoutText}>{busy ? "جاري الخروج..." : "تسجيل الخروج"}</Text></Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.65 : 1 }]}><View style={styles.menuIcon}><Text style={styles.menuIconText}>{icon}</Text></View><Text style={styles.menuLabel}>{label}</Text><Text style={styles.menuArrow}>←</Text></Pressable>;
}

const styles = StyleSheet.create({
  avatarButton: { alignItems: "center", backgroundColor: "#FFD166", borderColor: "#FFFFFF", borderRadius: 19, borderWidth: 2, height: 38, justifyContent: "center", overflow: "hidden", width: 38 }, compactAvatar: { height: 34, width: 34 }, avatarImage: { height: "100%", width: "100%" }, avatarInitial: { color: "#1D1A35", fontSize: 16, fontWeight: "900" }, overlay: { backgroundColor: "rgba(29,26,53,0.48)", flex: 1, flexDirection: "row" }, dismiss: { flex: 1 }, drawer: { backgroundColor: "#F8F7F2", borderBottomLeftRadius: 24, borderTopLeftRadius: 24, elevation: 12, padding: 20, shadowColor: "#1D1A35", shadowOpacity: 0.2, shadowRadius: 18, width: "82%" }, drawerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, drawerBrand: { alignItems: "center", backgroundColor: "#FFD166", borderRadius: 13, flexDirection: "row", paddingHorizontal: 10, paddingVertical: 6 }, drawerBrandText: { color: "#1D1A35", fontSize: 18, fontWeight: "900" }, drawerDot: { backgroundColor: "#F08A75", borderRadius: 4, height: 6, marginLeft: 4, width: 6 }, close: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, height: 32, justifyContent: "center", width: 32 }, closeText: { color: "#1D1A35", fontSize: 23, lineHeight: 25 }, userRow: { alignItems: "center", backgroundColor: "#1D1A35", borderRadius: 20, flexDirection: "row", marginTop: 22, padding: 14 }, largeAvatar: { backgroundColor: "#FFD166", borderColor: "#F08A75", borderRadius: 31, borderWidth: 2, height: 62, overflow: "visible", width: 62 }, largeAvatarImage: { borderRadius: 29, height: "100%", width: "100%" }, largeAvatarText: { color: "#1D1A35", fontSize: 24, fontWeight: "900", textAlign: "center", paddingTop: 15 }, cameraBadge: { alignItems: "center", backgroundColor: "#F08A75", borderColor: "#1D1A35", borderRadius: 11, borderWidth: 2, bottom: -3, height: 22, justifyContent: "center", position: "absolute", right: -3, width: 22 }, cameraText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", lineHeight: 17 }, userCopy: { flex: 1, marginLeft: 12 }, userName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", textAlign: "right" }, userEmail: { color: "#C8C4D6", fontSize: 10, marginTop: 4, textAlign: "right" }, changePhoto: { color: "#FFD166", fontSize: 9, marginTop: 6, textAlign: "right" }, menuList: { marginTop: 20 }, menuItem: { alignItems: "center", borderBottomColor: "#E9E6DE", borderBottomWidth: 1, flexDirection: "row", paddingVertical: 14 }, menuIcon: { alignItems: "center", backgroundColor: "#E7DEFF", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, menuIconText: { color: "#1D1A35", fontSize: 15, fontWeight: "900" }, menuLabel: { color: "#252239", flex: 1, fontSize: 13, fontWeight: "800", marginHorizontal: 12, textAlign: "right" }, menuArrow: { color: "#F08A75", fontSize: 19, fontWeight: "900" }, logout: { alignItems: "center", backgroundColor: "#FFF0EE", borderColor: "#F3C9C4", borderRadius: 14, borderWidth: 1, marginTop: "auto", paddingVertical: 13 }, logoutText: { color: "#C95D51", fontSize: 12, fontWeight: "900" },
});
