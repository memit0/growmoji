//
//  HabitTrackerWidgetsLiveActivity.swift
//  HabitTrackerWidgets
//
//  Created by Mehmet Battal on 11/05/2025.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct HabitTrackerWidgetsAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct HabitTrackerWidgetsLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: HabitTrackerWidgetsAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension HabitTrackerWidgetsAttributes {
    fileprivate static var preview: HabitTrackerWidgetsAttributes {
        HabitTrackerWidgetsAttributes(name: "World")
    }
}

extension HabitTrackerWidgetsAttributes.ContentState {
    fileprivate static var smiley: HabitTrackerWidgetsAttributes.ContentState {
        HabitTrackerWidgetsAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: HabitTrackerWidgetsAttributes.ContentState {
         HabitTrackerWidgetsAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: HabitTrackerWidgetsAttributes.preview) {
   HabitTrackerWidgetsLiveActivity()
} contentStates: {
    HabitTrackerWidgetsAttributes.ContentState.smiley
    HabitTrackerWidgetsAttributes.ContentState.starEyes
}
