import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useThemeContext } from "@/lib/theme-provider";

const SUPPORT_NUMBER = "201095314107";

export default function SettingsScreen() {
  const { user, logout } = useAuth({ autoFetch: true });
  const { colorScheme, setColorScheme } = useThemeContext();
  const [busy, setBusy] = useState(false);
  const isDark = colorScheme === "dark";
  const support = () => Linking.openURL(`https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent("مرحباً wm، أحتاج مساعدة")}`);
  const handleLogout = async () => { setBusy(true); await logout(); setBusy(false); };
  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#F8F7F2]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.headerKicker}>ملفك في wm</Text><Text style={styles.headerTitle}>الإعدادات</Text><Text style={styles.headerSubtitle}>تحكم في حسابك وتجربتك كما تحب.</Text></View>
        <View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name || "wm").slice(0, 1).toUpperCase()}</Text></View><View style={styles.profileCopy}><Text style={styles.profileName}>{user?.name || "زائر wm"}</Text><Text style={styles.profileEmail}>{user?.email || "لم تتم إضافة بريد بعد"}</Text></View><Text style={styles.profileArrow}>✦</Text></View>
        <Text style={styles.sectionLabel}>المظهر</Text>
        <View style={styles.settingCard}><View style={styles.settingIcon}><Text>◐</Text></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>الوضع الداكن</Text><Text style={styles.settingSubtitle}>{isDark ? "مفعّل الآن" : "المظهر الطبيعي مفعّل"}</Text></View><Switch value={isDark} onValueChange={(value) => setColorScheme(value ? "dark" : "light")} trackColor={{ false: "#DDD9D0", true: "#F08A75" }} thumbColor={isDark ? "#FFD166" : "#FFFFFF"} /></View>
        <Text style={styles.sectionLabel}>المساعدة والتواصل</Text>
        <Pressable onPress={support} style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.75 : 1 }]}><View style={[styles.settingIcon, { backgroundColor: "#D7F2E3" }]}><Text>◌</Text></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>تواصل مع الدعم</Text><Text style={styles.settingSubtitle}>نرد عليك عبر واتساب: +201095314107</Text></View><Text style={styles.chevron}>←</Text></Pressable>
        <Pressable onPress={support} style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.75 : 1 }]}><View style={[styles.settingIcon, { backgroundColor: "#FFE7B3" }]}><Text>?</Text></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>الاستفسارات والمساعدة</Text><Text style={styles.settingSubtitle}>اسألنا عن منتج أو طلب</Text></View><Text style={styles.chevron}>←</Text></Pressable>
        <Text style={styles.sectionLabel}>الحساب</Text>
        <Pressable onPress={handleLogout} disabled={busy} style={({ pressed }) => [styles.logoutButton, { opacity: pressed || busy ? 0.65 : 1 }]}><Text style={styles.logoutText}>{busy ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</Text></Pressable>
        <Text style={styles.footer}>wm · معك في كل لحظة صغيرة</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingBottom: 35 }, header: { backgroundColor: "#1D1A35", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 25 }, headerKicker: { color: "#FFD166", fontSize: 12, fontWeight: "800", textAlign: "right" }, headerTitle: { color: "#FFFFFF", fontSize: 32, fontWeight: "900", marginTop: 7, textAlign: "right" }, headerSubtitle: { color: "#C8C4D6", fontSize: 13, marginTop: 7, textAlign: "right" }, profileCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, flexDirection: "row", marginHorizontal: 22, marginTop: 18, padding: 15 }, avatar: { alignItems: "center", backgroundColor: "#FFD166", borderRadius: 25, height: 50, justifyContent: "center", width: 50 }, avatarText: { color: "#1D1A35", fontSize: 20, fontWeight: "900" }, profileCopy: { flex: 1, marginHorizontal: 12 }, profileName: { color: "#1D1A35", fontSize: 15, fontWeight: "900", textAlign: "right" }, profileEmail: { color: "#908C99", fontSize: 11, marginTop: 4, textAlign: "right" }, profileArrow: { color: "#F08A75", fontSize: 19 }, sectionLabel: { color: "#898591", fontSize: 12, fontWeight: "800", marginHorizontal: 22, marginTop: 25, marginBottom: 10, textAlign: "right" }, settingCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, flexDirection: "row", marginHorizontal: 22, padding: 15 }, actionCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, flexDirection: "row", marginHorizontal: 22, marginBottom: 9, padding: 15 }, settingIcon: { alignItems: "center", backgroundColor: "#E7DEFF", borderRadius: 13, height: 40, justifyContent: "center", width: 40 }, settingCopy: { flex: 1, marginHorizontal: 12 }, settingTitle: { color: "#252239", fontSize: 13, fontWeight: "800", textAlign: "right" }, settingSubtitle: { color: "#96929E", fontSize: 10, marginTop: 4, textAlign: "right" }, chevron: { color: "#F08A75", fontSize: 21, fontWeight: "800" }, logoutButton: { alignItems: "center", backgroundColor: "#FFF0EE", borderColor: "#F3C9C4", borderRadius: 15, borderWidth: 1, marginHorizontal: 22, paddingVertical: 14 }, logoutText: { color: "#C95D51", fontSize: 13, fontWeight: "900" }, footer: { color: "#AAA6AF", fontSize: 10, marginTop: 28, textAlign: "center" },
});
