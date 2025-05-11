//
//  HabitTrackerWidgets.swift
//  HabitTrackerWidgets
//
//  Created by Mehmet Battal on 11/05/2025.
//

import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        let habits = HabitDataStore.shared.getHabits()
        let tasks = HabitDataStore.shared.getTasks()
        return SimpleEntry(date: Date(), configuration: ConfigurationAppIntent(), habits: habits, tasks: tasks)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let habits = HabitDataStore.shared.getHabits()
        let tasks = HabitDataStore.shared.getTasks()
        return SimpleEntry(date: Date(), configuration: configuration, habits: habits, tasks: tasks)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Get user data from the HabitDataStore
        let habits = HabitDataStore.shared.getHabits()
        let tasks = HabitDataStore.shared.getTasks()
        
        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration, habits: habits, tasks: tasks)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }

//    func relevances() async -> WidgetRelevances<ConfigurationAppIntent> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let habits: [Habit]
    let tasks: [Task]
}

struct HabitTrackerWidgetsEntryView : View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("My Habits")
                .font(.headline)
                .padding(.bottom, 4)
            
            if entry.habits.isEmpty {
                Text("No habits yet")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.habits.prefix(3), id: \.id) { habit in
                    HStack {
                        Circle()
                            .fill(habit.isCompleted ? Color.green : Color.gray)
                            .frame(width: 10, height: 10)
                        Text(habit.name)
                            .font(.subheadline)
                        Spacer()
                        Text("🔥 \(habit.streak)")
                            .font(.caption)
                    }
                }
            }
            
            Divider()
            
            Text("Tasks")
                .font(.headline)
                .padding(.vertical, 4)
                
            if entry.tasks.isEmpty {
                Text("No tasks today")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.tasks.prefix(3), id: \.id) { task in
                    HStack {
                        Circle()
                            .fill(task.isCompleted ? Color.green : Color.gray)
                            .frame(width: 10, height: 10)
                        Text(task.title)
                            .font(.subheadline)
                            .lineLimit(1)
                    }
                }
            }
        }
        .padding()
    }
}

struct HabitTrackerWidgets: Widget {
    let kind: String = "HabitTrackerWidgets"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            HabitTrackerWidgetsEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}

extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }
    
    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

#Preview(as: .systemSmall) {
    HabitTrackerWidgets()
} timeline: {
    let sampleHabits = [
        Habit(id: "1", name: "Exercise", streak: 5, lastCompletedDate: Date(), isCompleted: true),
        Habit(id: "2", name: "Read", streak: 3, lastCompletedDate: Date(), isCompleted: false),
        Habit(id: "3", name: "Meditate", streak: 7, lastCompletedDate: Date(), isCompleted: true)
    ]
    
    let sampleTasks = [
        Task(id: "1", title: "Buy groceries", isCompleted: false, dueDate: Date()),
        Task(id: "2", title: "Call mom", isCompleted: true, dueDate: Date()),
        Task(id: "3", title: "Submit report", isCompleted: false, dueDate: Date())
    ]
    
    SimpleEntry(date: .now, configuration: .smiley, habits: sampleHabits, tasks: sampleTasks)
}
