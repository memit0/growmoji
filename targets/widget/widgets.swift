import WidgetKit
import SwiftUI

// MARK: - Data Models
struct WidgetHabit: Decodable, Identifiable {
    let id = UUID() // Add identifiable for lists
    var emoji: String
    var streak: Int
    var isLoggedToday: Int // 0 for false, 1 for true
}

struct WidgetTask: Decodable, Identifiable {
    let id = UUID() // Add identifiable for lists
    var title: String
    var is_completed: Int // 0 for false, 1 for true
}

struct WidgetData: Decodable {
    var tasks: [WidgetTask]
    var habits: [WidgetHabit]
    var appTheme: String? // Added to receive theme from app
    // var totalTasks: Int? // Can be used if needed
    // var activeHabits: Int? // Can be used if needed
}

// MARK: - Timeline Entry
struct HabitTrackerEntry: TimelineEntry {
    let date: Date
    let configuration: DisplayWidgetIntent // Use the new intent
    let habits: [WidgetHabit]
    let tasks: [WidgetTask]
    let appTheme: String? // Added to store the app's theme
    let relevance: TimelineEntryRelevance?

    static func placeholder(configuration: DisplayWidgetIntent = DisplayWidgetIntent()) -> HabitTrackerEntry {
        // Now returns empty data for a cleaner placeholder
        HabitTrackerEntry(date: Date(), configuration: configuration,
                          habits: [], 
                          tasks: [],
                          appTheme: nil, // Default appTheme
                          relevance: nil)
    }

    static func empty(configuration: DisplayWidgetIntent = DisplayWidgetIntent()) -> HabitTrackerEntry {
        HabitTrackerEntry(date: Date(), configuration: configuration, habits: [], tasks: [], appTheme: nil, relevance: nil)
    }
}

// MARK: - Timeline Provider
struct HabitTrackerTimelineProvider: AppIntentTimelineProvider {
    typealias Entry = HabitTrackerEntry
    typealias Intent = DisplayWidgetIntent

    private let appGroupId = "group.com.mebattll.habittracker.widget"
    private let userDefaultsKey = "widgetData"

    func placeholder(in context: Context) -> Entry {
        // Using print for debug logs in widget extension
        print("[HabitTrackerWidget] Providing placeholder entry.")
        return .placeholder()
    }

    func snapshot(for configuration: Intent, in context: Context) async -> Entry {
        print("[HabitTrackerWidget] Providing snapshot entry.")
        return fetchData(configuration: configuration) ?? .placeholder()
    }

    func timeline(for configuration: Intent, in context: Context) async -> Timeline<Entry> {
        print("[HabitTrackerWidget] Providing timeline.")
        guard let entry = fetchData(configuration: configuration) else {
            print("[HabitTrackerWidget] FetchData returned nil for timeline, using empty entry.")
            let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())! // Retry sooner if data failed
            return Timeline(entries: [Entry.empty(configuration: configuration)], policy: .after(nextUpdateDate))
        }
        
        print("[HabitTrackerWidget] Successfully fetched data for timeline. Habits: \(entry.habits.count), Tasks: \(entry.tasks.count)")
        let nextUpdateDate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        return Timeline(entries: [entry], policy: .after(nextUpdateDate))
    }
    
    private func fetchData(configuration: Intent) -> HabitTrackerEntry? {
        print("[HabitTrackerWidget] Attempting to fetch data. App Group: \(appGroupId), Key: \(userDefaultsKey)")
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            print("[HabitTrackerWidget] FAILED to initialize UserDefaults with suite name: \(appGroupId)")
            return nil
        }
        print("[HabitTrackerWidget] Successfully initialized UserDefaults.")

        guard let savedData = userDefaults.object(forKey: userDefaultsKey) as? Data else {
            print("[HabitTrackerWidget] FAILED to retrieve data as Data type for key '\(userDefaultsKey)'. Data might be missing or not Data type.")
            // Check if *any* object exists for the key to help diagnose
            if let anyObject = userDefaults.object(forKey: userDefaultsKey) {
                print("[HabitTrackerWidget] Found object for key '\(userDefaultsKey)' but it's not Data. Type: \(type(of: anyObject))")
            } else {
                print("[HabitTrackerWidget] No object found for key '\(userDefaultsKey)'.")
            }
            return HabitTrackerEntry.empty(configuration: configuration) // Return empty but valid entry
        }
        print("[HabitTrackerWidget] Successfully retrieved data as Data type for key '\(userDefaultsKey)'. Data size: \(savedData.count) bytes.")
        
        // Attempt to print the raw string if it's UTF-8, for debugging
        if let rawString = String(data: savedData, encoding: .utf8) {
            print("[HabitTrackerWidget] Raw data string (UTF-8): \(rawString)")
        } else {
            print("[HabitTrackerWidget] Raw data is not a valid UTF-8 string.")
        }

        let decoder = JSONDecoder()
        do {
            let loadedWidgetData = try decoder.decode(WidgetData.self, from: savedData)
            print("[HabitTrackerWidget] Successfully decoded WidgetData. Habits: \(loadedWidgetData.habits.count), Tasks: \(loadedWidgetData.tasks.count), AppTheme: \(loadedWidgetData.appTheme ?? "nil")")
            return HabitTrackerEntry(date: Date(), 
                                     configuration: configuration, 
                                     habits: Array(loadedWidgetData.habits.prefix(3)), 
                                     tasks: Array(loadedWidgetData.tasks.prefix(3)),
                                     appTheme: loadedWidgetData.appTheme, // Pass decoded appTheme
                                     relevance: nil)
        } catch {
            print("[HabitTrackerWidget] FAILED to decode WidgetData from savedData. Error: \(error.localizedDescription)")
            print("[HabitTrackerWidget] Decoding error details: \(error)") // Print full error
            return HabitTrackerEntry.empty(configuration: configuration) // Return empty but valid entry on decoding error
        }
    }
}

// MARK: - SwiftUI Views

struct HabitRowView: View {
    var habit: WidgetHabit

    var body: some View {
        HStack {
            Text(habit.emoji)
                .font(.title2)
            VStack(alignment: .leading) {
                Text("Streak: \(habit.streak)")
                    .font(.caption)
                    .foregroundColor(.gray)
                if habit.isLoggedToday == 1 {
                    Text("Logged Today ✔︎")
                        .font(.caption2)
                        .foregroundColor(.green)
                } else {
                    Text("Log Today! 🏃‍♂️")
                        .font(.caption2)
                        .foregroundColor(.orange)
                }
            }
            Spacer()
        }
    }
}

struct TaskRowView: View {
    var task: WidgetTask
    var appSpecifiedColorScheme: ColorScheme // Added: to correctly set text color

    var body: some View {
        HStack {
            Image(systemName: task.is_completed == 1 ? "checkmark.circle.fill" : "circle")
                .foregroundColor(task.is_completed == 1 ? .green : .gray) // Kept original logic for icon
            Text(task.title)
                .font(.subheadline)
                .strikethrough(task.is_completed == 1, color: .gray)
                .foregroundColor(
                    task.is_completed == 1 ? .gray : (appSpecifiedColorScheme == .light ? .black : .white)
                ) // Updated: Dynamic color based on scheme
            Spacer()
        }
    }
}

struct HabitTrackerWidgetEntryView : View {
    var entry: HabitTrackerTimelineProvider.Entry
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var systemColorScheme // For fallback

    // Determine effective color scheme based on app's preference
    var effectiveColorScheme: ColorScheme {
        if entry.appTheme == "dark" {
            return .dark
        } else if entry.appTheme == "light" {
            return .light
        } else {
            return systemColorScheme // Fallback to system
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if family == .systemSmall {
                SmallWidgetView(habits: entry.habits, appSpecifiedColorScheme: effectiveColorScheme)
            } else if family == .systemMedium {
                MediumWidgetView(tasks: entry.tasks, appSpecifiedColorScheme: effectiveColorScheme)
            } else {
                LargeWidgetView(habits: entry.habits, tasks: entry.tasks, appSpecifiedColorScheme: effectiveColorScheme)
            }
        }
        .padding()
    }
}

struct SmallWidgetView: View {
    var habits: [WidgetHabit]
    var appSpecifiedColorScheme: ColorScheme // New parameter to accept determined color scheme
    // @Environment(\.colorScheme) var colorScheme // Replaced by appSpecifiedColorScheme for relevant parts

    var body: some View {
        VStack(alignment: .leading) {
            Text("Habits")
                .font(.headline)
                .foregroundColor(appSpecifiedColorScheme == .light ? .black : .blue) // Use passed scheme
            if habits.isEmpty {
                Text("No habits to show. Add some in the app!")
                    .font(.caption)
                    .foregroundColor(.gray)
            } else {
                ForEach(habits) { habit in
                    HabitRowView(habit: habit)
                }
            }
            Spacer()
        }
    }
}

struct MediumWidgetView: View {
    var tasks: [WidgetTask]
    var appSpecifiedColorScheme: ColorScheme // New parameter
    // @Environment(\.colorScheme) var colorScheme // Replaced

    var body: some View {
        VStack(alignment: .leading) {
            Text("Tasks")
                .font(.headline)
                .foregroundColor(appSpecifiedColorScheme == .light ? .black : .purple) // Use passed scheme
            if tasks.isEmpty {
                Text("No tasks for today. Great job or add more!")
                    .font(.caption)
                    .foregroundColor(.gray)
            } else {
                ForEach(tasks) { task in
                    TaskRowView(task: task, appSpecifiedColorScheme: appSpecifiedColorScheme) // Updated: Pass scheme
                }
            }
            Spacer()
        }
    }
}

struct LargeWidgetView: View {
    var habits: [WidgetHabit]
    var tasks: [WidgetTask]
    var appSpecifiedColorScheme: ColorScheme // New parameter
    // @Environment(\.colorScheme) var colorScheme // Replaced

    var body: some View {
        VStack(alignment: .leading) {
            Text("Overview")
                .font(.title2).bold()
                .foregroundColor(appSpecifiedColorScheme == .light ? .black : .white) // Use passed scheme
            
            Divider()
            
            Text("Habits")
                .font(.headline)
                .foregroundColor(appSpecifiedColorScheme == .light ? .black : .blue) // Use passed scheme
                .padding(.top, 5)
            if habits.isEmpty {
                Text("No habits to show.").font(.caption).foregroundColor(.gray)
            } else {
                ForEach(habits) { habit in
                    HabitRowView(habit: habit)
                }
            }
            
            Divider().padding(.vertical, 5)
            
            Text("Tasks")
                .font(.headline)
                .foregroundColor(appSpecifiedColorScheme == .light ? .black : .purple) // Use passed scheme
            if tasks.isEmpty {
                Text("No tasks for today.").font(.caption).foregroundColor(.gray)
            } else {
                ForEach(tasks) { task in
                    TaskRowView(task: task, appSpecifiedColorScheme: appSpecifiedColorScheme) // Updated: Pass scheme
                }
            }
            Spacer()
        }
    }
}

// MARK: - Widget Definition
struct WidgetContentWrapper: View {
    var entry: HabitTrackerTimelineProvider.Entry
    @Environment(\.colorScheme) var systemColorScheme // Fallback system color scheme

    // Computed property for the color scheme
    private var determinedColorScheme: ColorScheme {
        if entry.appTheme == "dark" {
            return .dark
        } else if entry.appTheme == "light" {
            return .light
        } else {
            return systemColorScheme // Fallback to system's current color scheme
        }
    }

    var body: some View {
        HabitTrackerWidgetEntryView(entry: entry)
            .containerBackground(determinedColorScheme == .light ? .white : .black, for: .widget)
    }
}

struct HabitTrackerDisplayWidget: Widget {
    let kind: String = "HabitTrackerDisplayWidget" // Unique kind

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: DisplayWidgetIntent.self, provider: HabitTrackerTimelineProvider()) { entry in
            WidgetContentWrapper(entry: entry)
        }
        .configurationDisplayName("Habit & Task Tracker")
        .description("Track your habits and tasks at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews (Optional, for Xcode Previews)
#if DEBUG
struct HabitTrackerWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = HabitTrackerEntry.placeholder()
        
        Group {
            HabitTrackerWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
                .previewDisplayName("Small Widget")
            
            HabitTrackerWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .previewDisplayName("Medium Widget")
            
            HabitTrackerWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemLarge))
                .previewDisplayName("Large Widget")
        }
    }
}
#endif
