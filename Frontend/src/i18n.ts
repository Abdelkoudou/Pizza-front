import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      menu: 'Menu',
      ingredients: 'Ingredients',
      staff: 'Staff',
      whatIfSimulator: 'What-If Simulator',
      settings: 'Settings',
      logOut: 'Log Out',
      
      // Dashboard
      realtimeUsers: 'Realtime users',
      ordersToday: 'Orders today',
      revenue: 'Revenue',
      activeStaff: 'Active staff',
      statistics: 'Statistics',
      orderForecasting: 'Order Forecasting',
      hourly: 'Hourly',
      daily: 'Daily',
      weekly: 'Weekly',
      alerts: 'Alerts',
      usageAnalytics: 'Usage Analytics',
      ingredientsItemsUsage: 'Ingredients & Items Usage',
      salesAnalytics: 'Sales Analytics',
      mostSellingItems: 'Most Selling Items',
      
      // Charts
      pizza: 'Pizza',
      bar: 'Bar',
      others: 'Others',
      pastUsage: 'Past Usage',
      historical: 'Historical',
      forecast: 'Forecast',
      past: 'Past',
      actual: 'Actual',
      predicted: 'Predicted',
      
      // Menu Management
      menuManagement: 'Menu Management',
      today: 'Today',
      searchPlaceholder: 'Q Search',
      addNewPizza: 'Add New Pizza +',
      
      // Pizza Detail
      backToMenu: 'Back to Menu',
      netRevenue: 'Net Revenue',
      tomorrowIngredientForecast: "Tomorrow's Ingredient Forecast",
      loadingForecasts: 'Loading forecasts...',
      units: 'units',
      
      // Ingredients Management
      ingredientManagement: 'Ingredient Management',
      averageNeed: 'Average Need',
      name: 'Name',
      kind: 'Kind',
      priceDelta: 'Price Delta',
      stock: 'Stock',
      topping: 'Topping',
      sauce: 'Sauce',
      edge: 'Edge',
      size: 'Size',
      
      // Staff Management
      staffManagement: 'Staff Management',
      addNewStaff: 'Add New Staff +',
      
      // What-If Simulator
      whatIf: 'What-If',
      runScenario: 'Run Scenario',
      
      // Alerts
      highForecast: 'High Forecast',
      highDrop: 'High Drop',
      loadingForecastData: 'Loading forecast data...',
      
      // Language Switch
      language: 'Language',
      english: 'English',
      french: 'French'
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: 'Tableau de bord',
      menu: 'Menu',
      ingredients: 'Ingrédients',
      staff: 'Personnel',
      whatIfSimulator: 'Simulateur What-If',
      settings: 'Paramètres',
      logOut: 'Se déconnecter',
      
      // Dashboard
      realtimeUsers: 'Utilisateurs en temps réel',
      ordersToday: "Commandes aujourd'hui",
      revenue: 'Revenus',
      activeStaff: 'Personnel actif',
      statistics: 'Statistiques',
      orderForecasting: 'Prévision des commandes',
      hourly: 'Horaire',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      alerts: 'Alertes',
      usageAnalytics: "Analyses d'utilisation",
      ingredientsItemsUsage: 'Utilisation des ingrédients et articles',
      salesAnalytics: 'Analyses des ventes',
      mostSellingItems: 'Articles les plus vendus',
      
      // Charts
      pizza: 'Pizza',
      bar: 'Bar',
      others: 'Autres',
      pastUsage: 'Utilisation passée',
      historical: 'Historique',
      forecast: 'Prévision',
      past: 'Passé',
      actual: 'Réel',
      predicted: 'Prédit',
      
      // Menu Management
      menuManagement: 'Gestion du menu',
      today: "Aujourd'hui",
      searchPlaceholder: 'Q Rechercher',
      addNewPizza: 'Ajouter une nouvelle pizza +',
      
      // Pizza Detail
      backToMenu: 'Retour au menu',
      netRevenue: 'Revenus nets',
      tomorrowIngredientForecast: "Prévision d'ingrédients pour demain",
      loadingForecasts: 'Chargement des prévisions...',
      units: 'unités',
      
      // Ingredients Management
      ingredientManagement: 'Gestion des ingrédients',
      averageNeed: 'Besoin moyen',
      name: 'Nom',
      kind: 'Type',
      priceDelta: 'Delta de prix',
      stock: 'Stock',
      topping: 'Garniture',
      sauce: 'Sauce',
      edge: 'Bord',
      size: 'Taille',
      
      // Staff Management
      staffManagement: 'Gestion du personnel',
      addNewStaff: 'Ajouter nouveau personnel +',
      
      // What-If Simulator
      whatIf: 'What-If',
      runScenario: 'Exécuter le scénario',
      
      // Alerts
      highForecast: 'Prévision élevée',
      highDrop: 'Forte baisse',
      loadingForecastData: 'Chargement des données de prévision...',
      
      // Language Switch
      language: 'Langue',
      english: 'Anglais',
      french: 'Français'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;