# **App Name**: Kinetic Circuits

## Core Features:

- Training Configuration Page: Provides a user interface to define training parameters such as the number of participants (1-14) and the desired difficulty level using interactive controls and a dropdown selector.
- Circuit Generation Trigger: Activates the display of the generated workout circuit, populating the UI with structured mock training data based on the user's configurations.
- Dynamic Circuit Display: Presents a scrollable section of dynamically generated workout station cards on a dedicated page.
- Interactive Station Cards: Each card displays comprehensive details including the workout zone name, specific exercise, prominently highlighted equipment, and support for pairing two exercises (A/B) for partner-based training.
- Adaptive Exercise Re-roll Tool: Integrates a 'Change' (re-roll) button on each sub-exercise within a station card, acting as a placeholder to eventually utilize an AI tool for intelligently suggesting alternative, compatible exercises.
- Client-Side State Persistence: Employs zustand for efficient global state management and leverages browser localStorage or IndexedDB to ensure user configurations and generated workout data persist across browsing sessions.

## Style Guidelines:

- Primary vibrant cyan: #33CCFF. This bold, energetic hue (HSL 195, 80%, 50%) is chosen to reflect dynamism and technological sophistication, serving as the main accent for interactive elements and highlights in a dark-themed environment.
- Deep background: #141D1F. A dark navy-graphite shade (HSL 195, 20%, 10%) forms the base of the modern 'dark mode,' providing a stark, focused backdrop that enhances content legibility and depth.
- Secondary accent aqua: #5FE6C9. An analogous aqua tone (HSL 165, 70%, 60%) provides an additional, contrasting highlight color for secondary actions, information accents, or to add visual variation to the interface.
- Body and headline font: 'Inter' (sans-serif), selected for its modern, clean lines, and exceptional legibility across various screen sizes, supporting both strong headlines and clear body text descriptions of exercises.
- Glassmorphism styling: Primary content containers and interactive cards will feature semi-transparent backgrounds with subtle blur effects, creating depth and separation from the deep background while maintaining a sleek, futuristic aesthetic. Layouts will be responsive, ensuring optimal display on diverse web platforms.
- Minimalist vector icons: Utilise a set of high-contrast, streamlined vector icons for interactive elements, including a distinctive 're-roll' icon for exercise modifications, ensuring consistency with the overall modern and functional visual language.
- Subtle and smooth transitions: Incorporate gentle animation for page navigation, element interactions, and visual feedback upon button presses, enhancing user engagement and fluidity without distracting from the primary content.