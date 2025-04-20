import SwiftUI

struct AlphabeticalScrollView<Content: View, T: Identifiable>: View {
    @Binding var scrollTarget: String?
    @State private var activeIndex: String? = nil
    let items: [T]
    let sectionKeyPath: KeyPath<T, String>
    let content: (T) -> Content
    
    // Add a non-alphabetic section marker
    private let nonAlphaMarker = "#"
    
    // Generate alphabet sections with available letters highlighted
    private var alphabetSections: [(letter: String, isAvailable: Bool)] {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".map { String($0) }
        var availableFirstLetters = Set(items.map { 
            StringUtils.firstNormalizedLetter($0[keyPath: sectionKeyPath])
        })
        
        // Check if we have non-alphabetic entries
        let hasNonAlpha = items.contains { item in
            let letter = StringUtils.firstNormalizedLetter(item[keyPath: sectionKeyPath])
            return letter.isEmpty || !letter.first!.isLetter
        }
        
        if hasNonAlpha {
            availableFirstLetters.insert(nonAlphaMarker)
        }
        
        // Create alphabet array with regular letters
        var sections = alphabet.map { letter in
            (letter: letter, isAvailable: availableFirstLetters.contains(letter))
        }
        
        // Add the non-alphabetic marker if needed
        if hasNonAlpha {
            sections.append((letter: nonAlphaMarker, isAvailable: true))
        }
        
        return sections
    }
    
    // Dictionary of items grouped by first letter
    private var itemsByLetter: [String: [T]] {
        Dictionary(grouping: items) { item in
            let text = item[keyPath: sectionKeyPath]
            let firstLetter = StringUtils.firstNormalizedLetter(text)
            
            // If it doesn't start with a letter, use the non-alpha marker
            if firstLetter.isEmpty || !firstLetter.first!.isLetter {
                return nonAlphaMarker
            }
            
            return firstLetter
        }
    }
    
    var body: some View {
        ZStack(alignment: .trailing) {
            // Main content
            ScrollViewReader { scrollProxy in
                ZStack(alignment: .center) {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 16) {
                        ForEach(Array(itemsByLetter.keys.sorted()), id: \.self) { letter in
                            if let items = itemsByLetter[letter] {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(letter == nonAlphaMarker ? "#" : letter)
                                        .font(.title3)
                                        .fontWeight(.bold)
                                        .foregroundColor(Color.neutral)
                                        .padding(.horizontal)
                                        .id(letter)
                                    
                                    ForEach(items) { item in
                                        content(item)
                                    }
                                }
                                .padding(.bottom, 8)
                            }
                        }
                    }
                }
                .onChange(of: scrollTarget) { newValue in
                    if let target = newValue {
                        withAnimation {
                            scrollProxy.scrollTo(target, anchor: .top)
                        }
                        scrollTarget = nil  // Reset after scrolling
                    }
                }
                
                    // Large letter indicator
                    ZStack {
                        if let activeIndex = activeIndex {
                            Text(activeIndex)
                                .font(.system(size: 70, weight: .bold))
                                .foregroundColor(Color.background)
                                .padding(20)
                                .background(Color("primary").opacity(0.7))
                                .clipShape(Circle())
                                .transition(.scale.combined(with: .opacity))
                        }
                    }
                    .animation(.easeInOut(duration: 0.2), value: activeIndex)
                    .zIndex(100)
                }
            }
            
            // Alphabet side index - positioned on the right edge
            HStack(alignment: .top, spacing: 0) {
                // Add extra spacing to avoid overlap with content
                Spacer()
                
                GeometryReader { geo in
                    // Calculate total height for drag gesture
                    let totalHeight = geo.size.height
                    let itemHeight = totalHeight / CGFloat(alphabetSections.count)
                    
                    VStack(spacing: 0) {
                        ForEach(alphabetSections, id: \.letter) { section in
                            Text(section.letter)
                                .font(.system(size: 11))
                                .fontWeight(.semibold)
                                .frame(width: 16, height: itemHeight)
                                .foregroundColor(section.isAvailable 
                                    ? (activeIndex == section.letter ? Color.background : Color.neutral) 
                                    : Color.neutral.opacity(0.3))
                                .background(
                                    activeIndex == section.letter && section.isAvailable 
                                        ? Color("primary")
                                        : Color.clear
                                )
                                .clipShape(Circle())
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    if section.isAvailable {
                                        activeIndex = section.letter
                                        scrollTarget = section.letter
                                        // Add haptic feedback
                                        let generator = UIImpactFeedbackGenerator(style: .light)
                                        generator.impactOccurred()
                                        
                                        // Auto-clear the active index after a delay
                                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                                            withAnimation {
                                                if activeIndex == section.letter {
                                                    activeIndex = nil
                                                }
                                            }
                                        }
                                    }
                                }
                        }
                    }
                    .gesture(
                        DragGesture(minimumDistance: 0, coordinateSpace: .local)
                            .onChanged { value in
                                let index = Int((value.location.y / totalHeight) * CGFloat(alphabetSections.count))
                                if index >= 0 && index < alphabetSections.count {
                                    let section = alphabetSections[index]
                                    if section.isAvailable && activeIndex != section.letter {
                                        activeIndex = section.letter
                                        scrollTarget = section.letter
                                        // Add haptic feedback
                                        let generator = UIImpactFeedbackGenerator(style: .light)
                                        generator.impactOccurred()
                                    }
                                }
                            }
                            .onEnded { _ in
                                // Clear active index after drag ends
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                    withAnimation {
                                        activeIndex = nil
                                    }
                                }
                            }
                    )
                    .background(Color.backgroundOffset.opacity(0.5))
                    .cornerRadius(12)
                }
                .frame(width: 16)
            }
            .padding(.vertical, 10)
            .padding(.trailing, 8)
            .padding(.leading, 12) // Add leading padding to create space between content and index
        }
    }
}

#Preview {
    struct Item: Identifiable {
        let id = UUID()
        let name: String
    }
    
    let items = [
        Item(name: "Apple"),
        Item(name: "Banana"),
        Item(name: "Carrot"),
        Item(name: "Date"),
        Item(name: "Elderberry"),
        Item(name: "Fig"),
        Item(name: "Grape"),
        Item(name: "Honeydew")
    ]
    
    return AlphabeticalScrollView(
        scrollTarget: .constant(nil),
        items: items,
        sectionKeyPath: \.name
    ) { item in
        Text(item.name)
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.gray.opacity(0.2))
            .cornerRadius(8)
            .padding(.horizontal)
    }
}