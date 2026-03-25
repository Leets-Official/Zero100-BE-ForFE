export const formatToKST = (dateString: string): string => {
  const date = new Date(dateString);
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hours = kst.getUTCHours();
  const minutes = String(kst.getUTCMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};
