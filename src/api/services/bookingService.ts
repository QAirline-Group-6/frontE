import { BookingData, BookingResponse } from '../../types/booking';

const API_URL = 'http://localhost:4000';

class BookingService {
    // Tạo booking mới
    async createBooking(bookingData: BookingData): Promise<BookingResponse> {
        try {
            // Format the data before sending
            const formattedData = {
                ...bookingData,
                total_amount: Number(bookingData.total_amount),
                bookings: bookingData.bookings.map(booking => ({
                    ...booking,
                    flight_id: Number(booking.flight_id),
                    tickets: booking.tickets.map(ticket => ({
                        ...ticket,
                        seat_id: Number(ticket.seat_id),
                        price: Number(ticket.price),
                        customer: {
                            ...ticket.customer,
                            date_of_birth: ticket.customer.date_of_birth.split('-').reverse().join('-') // Convert yyyy-MM-dd to dd-MM-yyyy
                        }
                    }))
                }))
            };

            console.log('Formatted booking data:', JSON.stringify(formattedData, null, 2));

            const response = await fetch(`${API_URL}/bookings/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(errorData.message || 'Có lỗi xảy ra khi đặt vé');
            }

            const responseData = await response.json();
            console.log('API Success Response:', responseData);
            return responseData;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    // Lấy danh sách booking của user
    async getUserBookings(userId: number): Promise<BookingResponse[]> {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể lấy thông tin đặt vé');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw error;
        }
    }

    // Lấy chi tiết booking theo ID
    async getBookingById(bookingId: number): Promise<BookingResponse> {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể lấy thông tin đặt vé');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw error;
        }
    }

    // Cập nhật booking
    async updateBooking(bookingId: number, updateData: Partial<BookingData>): Promise<BookingResponse> {
        try {
            const response = await fetch(`${API_URL}/bookings/update/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể cập nhật đặt vé');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    // Hủy booking
    async cancelBooking(bookingId: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/bookings/cancel/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể hủy đặt vé');
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            throw error;
        }
    }
}

export default new BookingService(); 