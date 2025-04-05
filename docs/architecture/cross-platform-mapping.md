# Cross-Platform Component Mapping

This document provides a mapping between equivalent components across different platforms, helping developers maintain consistency when implementing parallel features.

## Navigation Components

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------------|------------------|
| Main Navigation | UINavigationController | NavigationView | Next.js Router |
| Tab Navigation | UITabBarController | BottomNavigationView | Custom tabs component |
| Screen Transition | UINavigationController.pushViewController | FragmentTransaction | Router.push |
| Back Navigation | UINavigationController.popViewController | onBackPressed | Router.back |

## UI Components

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------------|------------------|
| Screen/Page | UIViewController | Activity/Fragment | React Component/Page |
| List | UITableView | RecyclerView | `<ul>` or mapped components |
| Grid | UICollectionView | RecyclerView+GridLayoutManager | CSS Grid/Flexbox |
| Text | UILabel | TextView | `<p>`, `<span>` |
| Button | UIButton | Button | `<button>` |
| Input | UITextField | EditText | `<input>` |
| Image | UIImageView | ImageView | `<img>` |
| Loading | UIActivityIndicatorView | ProgressBar | Custom loading component |

## Data Flow Components

| Concept | iOS (Swift) | Android (Java/Kotlin) | Web (TypeScript) |
|---------|-------------|----------------------|------------------|
| Data Storage | CoreData | Room Database | IndexedDB |
| Network Requests | URLSession | Retrofit | fetch/axios |
| State Management | Combine/Observer | LiveData/Flow | React hooks/Context |
| Data Repository | Repository Pattern | Repository Pattern | Custom hooks |

## Code Pointers

### iOS Navigation Setup

```swift
// See: /ios/GaudiyaKirtan/GaudiyaKirtan/SceneDelegate.swift
func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = (scene as? UIWindowScene) else { return }
    
    let window = UIWindow(windowScene: windowScene)
    window.rootViewController = UINavigationController(rootViewController: HomeViewController())
    self.window = window
    window.makeKeyAndVisible()
}
```

### Android Main Activity

```java
// See: /android/app/src/main/java/com/gaudiyakirtan/MainActivity.java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

### Web Navigation

```typescript
// See: /web/src/pages/index.tsx
// Next.js uses file-based routing
export default function Home() {
  // Component implementation...
}
```

## Implementation Guidelines

When implementing a new feature across platforms:

1. Identify the appropriate equivalent components for each platform
2. Maintain consistent naming (with appropriate platform conventions)
3. Ensure data models and business logic behavior match across implementations
4. Document platform-specific quirks or deviations when necessary