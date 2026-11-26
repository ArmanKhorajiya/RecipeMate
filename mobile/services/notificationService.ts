import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return requestedPermission.granted;
}

export async function scheduleWeeklyMealReminder(
  mealName: string,
  recipeName: string,
  weekday: number,
  hour: number,
  minute: number,
) {
  if (weekday < 1 || weekday > 7) {
    throw new Error("Invalid weekday.");
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    throw new Error("Notification permission was not granted.");
  }

  // Do not create a custom Android channel here.
  // Expo Go SDK 58 has a reported Android channel API issue.
  // Let Android use its default notification channel.

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time for ${mealName}! 🍽️`,
      body: `Prepare your planned recipe: ${recipeName}`,
      sound: true,
      data: {
        mealName,
        recipeName,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
    },
  });

  return notificationId;
}

export async function cancelMealReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllMealReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
