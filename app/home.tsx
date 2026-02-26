import React from "react";
import { Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
// For environment compatibility, we use standard image placeholder and mock functions
// In your local project, the original imports are correct.

// --- Mocking Expo Dependencies for Environment ---
// You MUST keep the original imports in your local project's home.tsx file!
// import { useRouter } from "expo-router"; 
// import { MaterialCommunityIcons } from '@expo/vector-icons'; 
const useRouter = () => ({ push: (route: string) => console.log(`Navigating to: ${route}`) });
const MaterialCommunityIcons = {
  glyphMap: { 'account-check': 1, 'calendar-clock': 2, 'file-clock': 3, 'poll': 4, 'credit-card-check': 5, 'clipboard-check': 6, 'home-variant': 7 },
  // Simple component placeholder that takes the icon name and renders an emoji for visual feedback
  Component: ({ name, size, color }: { name: string, size: number, color: string }) => {
    const iconMap = {
      'account-check': '✅', 'calendar-clock': '📅', 'file-clock': '⏱️', 'poll': '📊', 
      'credit-card-check': '💳', 'clipboard-check': '📋', 'home-variant': '🏠'
    };
    return <Text style={{ fontSize: size, color: color }}>{iconMap[name as keyof typeof iconMap] || '❓'}</Text>;
  },
  // We use this component placeholder below
  // @ts-ignore
  name: "MaterialCommunityIcons" 
};
const Icon = MaterialCommunityIcons.Component;

// --- Configuration ---
const { width } = Dimensions.get('window');
const ICON_SIZE = 30;

const COLORS = {
  primary: '#4F46E5', 
  headerBackground: '#264D70', // Deep blue
  white: '#FFFFFF',
  textDark: '#1F2937',
  textLight: '#4B5563',
  cardBackground: '#F9FAFB', // Light gray/off-white for cards
  attendanceFill: '#34D399', // Green for positive status
  shadowColor: '#000',
};



// --- Data Structure for Quick Access Grid ---

interface GridItem {
  key: string;
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
}

const QuickAccessData: GridItem[] = [
  { key: 'attendance', title: 'Attendance', iconName: 'account-check', route: '/attendance' },
  { key: 'schedule', title: 'Class Schedule', iconName: 'calendar-clock', route: '/schedule' },
  { key: 'exam', title: 'Exam Time Table', iconName: 'file-clock', route: '/exam-schedule' },
  { key: 'result', title: 'Result', iconName: 'poll', route: '/marks' },
  { key: 'fees', title: 'Fees Paid', iconName: 'credit-card-check', route: '/fees' },
];

// --- Custom Component: Quick Access Card ---

interface QuickAccessCardProps {
  item: GridItem;
  onPress: () => void;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ item, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.gridItem, pressed && styles.gridItemPressed]}
    onPress={onPress}
  >
    <Icon name={item.iconName} size={ICON_SIZE} color={COLORS.headerBackground} />
    <Text style={styles.gridItemText} numberOfLines={2}>{item.title}</Text>
  </Pressable>
);


// --- Main Home Screen Component ---

export default function HomeScreen() {
  const router = useRouter();

  //demo user data 
  const mockProfile = {
    name: 'USER123',
    greeting: 'Good Morning',
    attendance: {
      theory: 85, 
      practical: 92,
      overall: 88
    }
  };

  const handleNavigation = (route: string) => {
    // Navigate using the Expo Router push method
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBackground} />
      
      {/* 1. Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{mockProfile.greeting}</Text>
          <Text style={styles.nameText}>{mockProfile.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Attendance Card (Top Card) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Attendance</Text>
            <Icon name="clipboard-check" size={24} color={COLORS.headerBackground} />
          </View>

          {/* Attendance Details */}
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceLabel}>Theory</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${mockProfile.attendance.theory}%` }]} />
            </View>
            <Text style={styles.attendanceValue}>{mockProfile.attendance.theory}%</Text>
          </View>
          
          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceLabel}>Practical</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${mockProfile.attendance.practical}%` }]} />
            </View>
            <Text style={styles.attendanceValue}>{mockProfile.attendance.practical}%</Text>
          </View>

          <View style={styles.attendanceRow}>
            <Text style={styles.attendanceLabel}>Overall</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${mockProfile.attendance.overall}%` }]} />
            </View>
            <Text style={styles.attendanceValue}>{mockProfile.attendance.overall}%</Text>
          </View>
        </View>

        {/* 3. Quick Access Grid */}
        <View style={[styles.card, { padding: 10 }]}>
          <View style={styles.gridContainer}>
            {QuickAccessData.map((item) => (
              <QuickAccessCard 
                key={item.key} 
                item={item} 
                onPress={() => handleNavigation(item.route)} 
              />
            ))}
          </View>
        </View>
        
        {/* 4. Today's Schedule (Placeholder)
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Today's Schedule</Text>
          <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>9:00 AM - 10:00 AM</Text>
              <Text style={styles.scheduleSubject}>Web Technology (Room 305)</Text>
          </View>
          <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>10:00 AM - 11:00 AM</Text>
              <Text style={styles.scheduleSubject}>Advanced Mathematics (Room 306)</Text>
          </View>
        </View> */}

      </ScrollView>

      {/* 5. Navigation Bar (Simplified Placeholder) */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => handleNavigation('/home')}>
          <Icon name="home-variant" size={24} color={COLORS.headerBackground} />
          <Text style={styles.navTextActive}>Home</Text>
        </Pressable>
        {/* Other navigation icons go here (e.g., chat, profile, notifications) */}
      </View>
    </View>
  );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for the bottom nav
  },

  // 1. Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40, // Extra padding for status bar visibility
    backgroundColor: COLORS.headerBackground,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // 2. Card Styles (General)
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 16,
    marginTop: 16,
    // Soft Shadow
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Lighter border
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Attendance Specific Styles
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  attendanceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    width: 70, // Fixed width for alignment
    marginRight: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.attendanceFill,
    borderRadius: 4,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // 3. Quick Access Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  gridItem: {
    width: (width - 32 - 40) / 3, // Screen width - padding (32) - margin (40) / 3 items
    margin: 5,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.cardBackground, // Use card background to blend slightly
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridItemPressed: {
    opacity: 0.8,
    backgroundColor: '#F3F4F6', // Slight press feedback
  },
  gridItemText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: COLORS.textDark,
    paddingHorizontal: 2,
  },
  
  // 4. Schedule Styles
  scheduleContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  scheduleItem: {
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
    marginBottom: 5,
  },
  scheduleTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  scheduleSubject: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDark,
  },

  // 5. Bottom Navigation Bar Styles
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Shadow for elevation
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navTextActive: {
    fontSize: 10,
    color: COLORS.headerBackground,
    fontWeight: 'bold',
  },
});
