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
    // var totalTasks: Int? // Can be used if needed
    // var activeHabits: Int? // Can be used if needed
}

// MARK: - Timeline Entry
struct HabitTrackerEntry: TimelineEntry {
    let date: Date
    let configuration: DisplayWidgetIntent // Use the new intent
    let habits: [WidgetHabit]
    let tasks: [WidgetTask]
    let relevance: TimelineEntryRelevance?

    static func placeholder() -> HabitTrackerEntry {
        HabitTrackerEntry(date: Date(), configuration: DisplayWidgetIntent(), 
                          habits: [
                            WidgetHabit(emoji: "🧘", streak: 5, isLoggedToday: 1),
                            WidgetHabit(emoji: "📚", streak: 3, isLoggedToday: 0)
                          ],
                          tasks: [
                            WidgetTask(title: "Finish report", is_completed: 0),
                            WidgetTask(title: "Grocery shopping", is_completed: 1)
                          ],
                          relevance: nil)
    }

    static func empty() -> HabitTrackerEntry {
        HabitTrackerEntry(date: Date(), configuration: DisplayWidgetIntent(), habits: [], tasks: [], relevance: nil)
    }
}

// MARK: - Timeline Provider
struct HabitTrackerTimelineProvider: AppIntentTimelineProvider {
    typealias Entry = HabitTrackerEntry
    typealias Intent = DisplayWidgetIntent

    private let appGroupId = "group.com.mebattll.habittracker.widget"
    private let userDefaultsKey = "widgetData"

    func placeholder(in context: Context) -> Entry {
        .placeholder()
    }

    func snapshot(for configuration: Intent, in context: Context) async -> Entry {
        fetchData() ?? .placeholder()
    }

    func timeline(for configuration: Intent, in context: Context) async -> Timeline<Entry> {
        let entry = fetchData() ?? .empty()
        // Refresh every hour, or sooner if app signals update
        let nextUpdateDate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        return Timeline(entries: [entry], policy: .after(nextUpdateDate))
    }
    
    private func fetchData() -> HabitTrackerEntry? {
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return nil
        }

        guard let savedData = userDefaults.object(forKey: userDefaultsKey) as? Data else {
             // Return empty state if no data, rather than placeholder, for a real timeline
            return HabitTrackerEntry(date: Date(), configuration: DisplayWidgetIntent(), habits: [], tasks: [], relevance: nil)
        }

        let decoder = JSONDecoder()
        if let loadedWidgetData = try? decoder.decode(WidgetData.self, from: savedData) {
            return HabitTrackerEntry(date: Date(), 
                                     configuration: DisplayWidgetIntent(), 
                                     habits: Array(loadedWidgetData.habits.prefix(3)), 
                                     tasks: Array(loadedWidgetData.tasks.prefix(3)),
                                     relevance: nil)
        } else {
            // Data might be malformed, return empty
             return HabitTrackerEntry(date: Date(), configuration: DisplayWidgetIntent(), habits: [], tasks: [], relevance: nil)
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

    var body: some View {
        HStack {
            Image(systemName: task.is_completed == 1 ? "checkmark.circle.fill" : "circle")
                .foregroundColor(task.is_completed == 1 ? .green : .gray)
            Text(task.title)
                .font(.subheadline)
                .strikethrough(task.is_completed == 1, color: .gray)
                .foregroundColor(task.is_completed == 1 ? .gray : .primary)
            Spacer()
        }
    }
}

struct HabitTrackerWidgetEntryView : View {
    var entry: HabitTrackerTimelineProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if family == .systemSmall {
                SmallWidgetView(habits: entry.habits)
            } else if family == .systemMedium {
                MediumWidgetView(tasks: entry.tasks)
            } else {
                LargeWidgetView(habits: entry.habits, tasks: entry.tasks)
            }
        }
        .padding()
    }
}

struct SmallWidgetView: View {
    var habits: [WidgetHabit]
    var body: some View {
        VStack(alignment: .leading) {
            Text("Habits")
                .font(.headline)
                .foregroundColor(.blue)
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
    var body: some View {
        VStack(alignment: .leading) {
            Text("Tasks")
                .font(.headline)
                .foregroundColor(.purple)
            if tasks.isEmpty {
                Text("No tasks for today. Great job or add more!")
                    .font(.caption)
                    .foregroundColor(.gray)
            } else {
                ForEach(tasks) { task in
                    TaskRowView(task: task)
                }
            }
            Spacer()
        }
    }
}

struct LargeWidgetView: View {
    var habits: [WidgetHabit]
    var tasks: [WidgetTask]

    var body: some View {
        VStack(alignment: .leading) {
            Text("Overview")
                .font(.title2).bold()
            
            Divider()
            
            Text("Habits")
                .font(.headline)
                .foregroundColor(.blue)
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
                .foregroundColor(.purple)
            if tasks.isEmpty {
                Text("No tasks for today.").font(.caption).foregroundColor(.gray)
            } else {
                ForEach(tasks) { task in
                    TaskRowView(task: task)
                }
            }
            Spacer()
        }
    }
}

// MARK: - Widget Definition
struct HabitTrackerDisplayWidget: Widget {
    let kind: String = "HabitTrackerDisplayWidget" // Unique kind

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: DisplayWidgetIntent.self, provider: HabitTrackerTimelineProvider()) { entry in
            HabitTrackerWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
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
