//
//  HabitTrackerWidgetsBundle.swift
//  HabitTrackerWidgets
//
//  Created by Mehmet Battal on 11/05/2025.
//

import WidgetKit
import SwiftUI

@main
struct HabitTrackerWidgetsBundle: WidgetBundle {
    var body: some Widget {
        HabitTrackerWidgets()
        HabitTrackerWidgetsControl()
        HabitTrackerWidgetsLiveActivity()
    }
}
