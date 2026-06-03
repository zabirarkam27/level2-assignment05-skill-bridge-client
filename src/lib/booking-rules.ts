import { Booking } from "@/types/routes.type";

export const hasSessionStarted = (booking: Pick<Booking, "dateTime">) => {
  return new Date(booking.dateTime).getTime() <= Date.now();
};

export const isBookingPaymentPaid = (booking: Pick<Booking, "payment">) => {
  return booking.payment?.status === "PAID";
};

export const canStudentCancelBooking = (booking: Pick<Booking, "status">) => {
  return booking.status === "PENDING";
};

export const canAdminCancelBooking = (booking: Pick<Booking, "status">) => {
  return booking.status === "PENDING" || booking.status === "CONFIRMED";
};

export const canConfirmBooking = (
  booking: Pick<Booking, "status" | "dateTime" | "payment">,
) => {
  return (
    booking.status === "PENDING" &&
    isBookingPaymentPaid(booking) &&
    !hasSessionStarted(booking)
  );
};

export const canCompleteBooking = (
  booking: Pick<Booking, "status" | "dateTime">,
) => {
  return booking.status === "CONFIRMED" && hasSessionStarted(booking);
};
