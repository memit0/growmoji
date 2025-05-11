import Foundation
import React

@objc(WidgetDataManager)
class WidgetDataManager: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc(updateWidgetData:tasks:)
    func updateWidgetData(_ habits: [[String: Any]], tasks: [[String: Any]]) -> Void {
        let habitDataStore = HabitDataStore.shared
        
        let mappedHabits = habits.compactMap { habitDict -> Habit? in
            guard let id = habitDict["id"] as? String,
                  let name = habitDict["name"] as? String,
                  let streak = habitDict["streak"] as? Int,
                  let isCompleted = habitDict["isCompleted"] as? Bool else {
                return nil
            }
            
            let lastCompletedDate = habitDict["lastCompletedDate"] as? Date
            
            return Habit(id: id,
                        name: name,
                        streak: streak,
                        lastCompletedDate: lastCompletedDate,
                        isCompleted: isCompleted)
        }
        
        let mappedTasks = tasks.compactMap { taskDict -> Task? in
            guard let id = taskDict["id"] as? String,
                  let title = taskDict["title"] as? String,
                  let isCompleted = taskDict["isCompleted"] as? Bool else {
                return nil
            }
            
            let dueDate = taskDict["dueDate"] as? Date
            
            return Task(id: id,
                       title: title,
                       isCompleted: isCompleted,
                       dueDate: dueDate)
        }
        
        habitDataStore.saveHabits(mappedHabits)
        habitDataStore.saveTasks(mappedTasks)
        
        WidgetCenter.shared.reloadAllTimelines()
    }
} 