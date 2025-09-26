export class ThemeManager {
  private static observer: MutationObserver | null = null;

  static initializeTheme(): () => void {
    // Get saved theme from localStorage or default to 'white'
    const savedTheme = localStorage.getItem('theme') || 'white';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log(`🎨 Theme set to ${savedTheme} for SEMS`);

    // Observe theme changes to persist them
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          if (currentTheme) {
            localStorage.setItem('theme', currentTheme);
          }
        }
      });
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Return cleanup function
    return () => {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    };
  }

  static cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}