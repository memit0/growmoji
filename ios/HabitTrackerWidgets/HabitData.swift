import Foundation
import WidgetKit

struct Habit: Codable {
    let id: String
    let name: String
    let streak: Int
    let lastCompletedDate: Date?
    var isCompleted: Bool
}

struct Task: Codable {
    let id: String
    let title: String
    let isCompleted: Bool
    let dueDate: Date?
}

class HabitDataStore {
    static let shared = HabitDataStore()
    private let userDefaults: UserDefaults?
    
    private enum Keys {
        static let habits = "widget_habits"
        static let tasks = "widget_tasks"
    }
    
    init() {
        userDefaults = UserDefaults(suiteName: "group.com.mebattll.habittracker.widget")
    }
    
    func saveHabits(_ habits: [Habit]) {
        guard let data = try? JSONEncoder().encode(habits) else { return }
        userDefaults?.set(data, forKey: Keys.habits)
    }
    
    func saveTasks(_ tasks: [Task]) {
        guard let data = try? JSONEncoder().encode(tasks) else { return }
        userDefaults?.set(data, forKey: Keys.tasks)
    }
    
    func getHabits() -> [Habit] {
        guard let data = userDefaults?.data(forKey: Keys.habits),
              let habits = try? JSONDecoder().decode([Habit].self, from: data) else {
            return []
        }
        return habits
    }
    
    func getTasks() -> [Task] {
        guard let data = userDefaults?.data(forKey: Keys.tasks),
              let tasks = try? JSONDecoder().decode([Task].self, from: data) else {
            return []
        }
        return tasks
    }
} 