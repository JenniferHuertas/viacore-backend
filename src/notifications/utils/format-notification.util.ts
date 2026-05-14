export const formatNotification = (
  title: string,
  message: string,
) => {
  return {
    title: title.trim(),

    message: message.trim(),
  };
};