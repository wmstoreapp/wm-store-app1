import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useThemeContext } from "@/lib/theme-provider";
import { ProfileMenu } from "@/components/profile-menu";
import { getProfileAvatar } from "@/lib/profile";

const SUPPORT_NUMBER = "201095314107";

export default function SettingsScreen() {
  const { user, logout } = useAuth({ autoFetch: true });
  const { colorScheme, preference, setColorScheme } = useThemeContext();
  const [busy, setBusy] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const dark = colorScheme === "dark";
  useEffect(() => { getProfileAvatar().then(setAvatar); }, []);
  const support = () => Linking.openURL(`https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent("مرحباً wm، أحتاج مساعدة")}`);
  const handleLogout = async () => { setBusy(true); await logout(); setBusy(false); };
  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName={dark ? "bg-[#17152A]" : "bg-[#F8F7F2]"}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><View style={styles.headerRow}><View><Text style={styles.headerKicker}>ملفك في wm</Text><Text style={styles.headerTitle}>الإعدادات</Text></View><ProfileMenu compact /></View><Text style={styles.headerSubtitle}>تحكم في حسابك وتجربتك كما تحب.</Text></View>
        <View style={[styles.profileCard, dark && styles.darkCard]}><View style={styles.avatar}>{avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{(user?.name || "wm").slice(0, 1).toUpperCase()}</Text>}</View><View style={styles.profileCopy}><Text style={[styles.profileName, dark && styles.darkText]}>{user?.name || "زائر wm"}</Text><Text style={[styles.profileEmail, dark && styles.darkSecondary]}>{user?.email || "لم تتم إضافة بريد بعد"}</Text></View><Text style={styles.profileArrow}>✦</Text></View>
        <Text style={[styles.sectionLabel, dark && styles.darkSecondary]}>المظهر</Text>
        <View style={[styles.themeCard, dark && styles.darkCard]}><Text style={[styles.themeHint, dark && styles.darkSecondary]}>اختر الجو الذي يناسبك</Text><View style={styles.themeOptions}>
          <ThemeOption label="فاتح" icon="☼" active={preference === "light"} dark={dark} onPress={() => setColorScheme("light")} />
          <ThemeOption label="داكن" icon="☾" active={preference === "dark"} dark={dark} onPress={() => setColorScheme("dark")} />
          <ThemeOption label="تلقائي" icon="◐" active={preference === "system"} dark={dark} onPress={() => setColorScheme("system")} />
        </View></View>
        <Text style={[styles.sectionLabel, dark && styles.darkSecondary]}>المساعدة والتواصل</Text>
        <Pressable onPress={support} style={({ pressed }) => [styles.actionCard, dark && styles.darkCard, { opacity: pressed ? 0.75 : 1 }]}><View style={[styles.settingIcon, { backgroundColor: dark ? "#284D45" : "#D7F2E3" }]}><Text>◌</Text></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, dark && styles.darkText]}>تواصل مع الدعم</Text><Text style={[styles.settingSubtitle, dark && styles.darkSecondary]}>نرد عليك عبر واتساب: +201095314107</Text></View><Text style={styles.chevron}>←</Text></Pressable>
        <Pressable onPress={support} style={({ pressed }) => [styles.actionCard, dark && styles.darkCard, { opacity: pressed ? 0.75 : 1 }]}><View style={[styles.settingIcon, { backgroundColor: dark ? "#4B3E62" : "#FFE7B3" }]}><Text>?</Text></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, dark && styles.darkText]}>الاستفسارات والمساعدة</Text><Text style={[styles.settingSubtitle, dark && styles.darkSecondary]}>اسألنا عن منتج أو طلب</Text></View><Text style={styles.chevron}>←</Text></Pressable>
        <Text style={[styles.sectionLabel, dark && styles.darkSecondary]}>الحساب</Text><Pressable onPress={handleLogout} disabled={busy} style={({ pressed }) => [styles.logoutButton, { opacity: pressed || busy ? 0.65 : 1 }]}><Text style={styles.logoutText}>{busy ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</Text></Pressable>
        <Text style={styles.footer}>wm · معك في كل لحظة صغيرة</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function ThemeOption({ label, icon, active, dark, onPress }: { label: string; icon: string; active: boolean; dark: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.themeOption, dark && styles.darkOption, active && styles.themeOptionActive]}><Text style={[styles.themeIcon, active && styles.themeIconActive]}>{icon}</Text><Text style={[styles.themeLabel, dark && styles.darkSecondary, active && styles.themeLabelActive]}>{label}</Text>{active ? <View style={styles.activeDot} /> : null}</Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 35 }, header: { backgroundColor: "#1D1A35", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 25 }, headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, headerKicker: { color: "#FFD166", fontSize: 12, fontWeight: "800", textAlign: "right" }, headerTitle: { color: "#FFFFFF", fontSize: 32, fontWeight: "900", marginTop: 7, textAlign: "right" }, headerSubtitle: { color: "#C8C4D6", fontSize: 13, marginTop: 7, textAlign: "right" }, profileCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, flexDirection: "row", marginHorizontal: 22, marginTop: 18, padding: 15 }, darkCard: { backgroundColor: "#24213D", borderColor: "#403B60" }, avatar: { alignItems: "center", backgroundColor: "#FFD166", borderRadius: 25, height: 50, justifyContent: "center", overflow: "hidden", width: 50 }, avatarImage: { height: "100%", width: "100%" }, avatarText: { color: "#1D1A35", fontSize: 20, fontWeight: "900" }, profileCopy: { flex: 1, marginHorizontal: 12 }, profileName: { color: "#1D1A35", fontSize: 15, fontWeight: "900", textAlign: "right" }, profileEmail: { color: "#908C99", fontSize: 11, marginTop: 4, textAlign: "right" }, profileArrow: { color: "#F08A75", fontSize: 19 }, sectionLabel: { color: "#898591", fontSize: 12, fontWeight: "800", marginHorizontal: 22, marginTop: 25, marginBottom: 10, textAlign: "right" }, themeCard: { backgroundColor: "#FFFFFF", borderRadius: 18, marginHorizontal: 22, padding: 14 }, themeHint: { color: "#807B89", fontSize: 11, marginBottom: 10, textAlign: "right" }, themeOptions: { flexDirection: "row", gap: 8 }, themeOption: { alignItems: "center", backgroundColor: "#F8F7F2", borderColor: "#E8E3D8", borderRadius: 14, borderWidth: 1, flex: 1, paddingVertical: 11 }, darkOption: { backgroundColor: "#17152A", borderColor: "#403B60" }, themeOptionActive: { backgroundColor: "#1D1A35", borderColor: "#FFD166" }, themeIcon: { color: "#1D1A35", fontSize: 20 }, themeIconActive: { color: "#FFD166" }, themeLabel: { color: "#555160", fontSize: 10, fontWeight: "800", marginTop: 4 }, themeLabelActive: { color: "#FFFFFF" }, activeDot: { backgroundColor: "#F08A75", borderRadius: 3, height: 6, marginTop: 5, width: 6 }, settingCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, flexDirection: "row", marginHorizontal: 22, padding: 15 }, actionCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, flexDirection: "row", marginHorizontal: 22, marginBottom: 9, padding: 15 }, settingIcon: { alignItems: "center", borderRadius: 13, height: 40, justifyContent: "center", width: 40 }, settingCopy: { flex: 1, marginHorizontal: 12 }, settingTitle: { color: "#252239", fontSize: 13, fontWeight: "800", textAlign: "right" }, settingSubtitle: { color: "#96929E", fontSize: 10, marginTop: 4, textAlign: "right" }, chevron: { color: "#F08A75", fontSize: 21, fontWeight: "800" }, logoutButton: { alignItems: "center", backgroundColor: "#FFF0EE", borderColor: "#F3C9C4", borderRadius: 15, borderWidth: 1, marginHorizontal: 22, paddingVertical: 14 }, logoutText: { color: "#C95D51", fontSize: 13, fontWeight: "900" }, footer: { color: "#AAA6AF", fontSize: 10, marginTop: 28, textAlign: "center" }, darkText: { color: "#FFF8E8" }, darkSecondary: { color: "#BDB9CD" },
});
