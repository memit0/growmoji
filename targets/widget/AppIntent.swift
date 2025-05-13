import WidgetKit
import AppIntents

// Simplified intent for the display widget.
// Configuration options can be added here later if needed.
struct DisplayWidgetIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Widget Configuration" }
    static var description: IntentDescription { "Displays habits and tasks." }

    // If you had configurable options for the display widget, they would go here.
    // For now, it's empty as data comes from UserDefaults.
}
