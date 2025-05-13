import WidgetKit
import SwiftUI

@main
struct exportWidgets: WidgetBundle {
    var body: some Widget {
        HabitTrackerDisplayWidget() // Our new display widget
        widgetControl() // Existing control widget
        // WidgetLiveActivity() // Assuming this is for future or separate functionality
    }
}
