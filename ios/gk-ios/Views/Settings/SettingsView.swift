// Views/Settings/SettingsView.swift
import SwiftUI

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Appearance")) {
                    NavigationLink("Theme") {
                        Text("Theme Settings")
                    }
                    NavigationLink("Language") {
                        Text("Language Settings")
                    }
                }
                
                Section(header: Text("About")) {
                    NavigationLink("Version") {
                        Text("1.0.0")
                    }
                    NavigationLink("Contact") {
                        Text("Contact Information")
                    }
                    NavigationLink("Donate") {
                        Text("Donation Options")
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarItems(trailing: Button("Done") {
                dismiss()
            })
        }
    }
}