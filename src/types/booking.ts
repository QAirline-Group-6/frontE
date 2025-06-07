export interface Customer {
    first_name: string;
    last_name: string;
    address: string;
    gender: 'male' | 'female';
    date_of_birth: string;
    id_card_number: string;
    status: 'confirmed' | 'cancelled';
}

export interface Ticket {
    customer: Customer;
    seat_id: number;
    price: number;
}

export interface BookingItem {
    flight_id: number;
    tickets: Ticket[];
}

export interface BookingData {
    booking_code: string;
    user_id: number;
    total_amount: number;
    status: 'confirmed' | 'cancelled' | 'completed';
    bookings: BookingItem[];
}

export interface BookingResponse {
    booking: {
        booking_id: number;
        booking_code: string;
        user_id: number;
        booking_time: string;
        status: 'confirmed' | 'cancelled' | 'completed';
        total_amount: number;
    };
    tickets: Array<{
        ticket: {
            ticket_id: number;
            booking_id: number;
            flight_id: number;
            seat_id: number;
            customer_id: number;
            price: number;
            status: string;
        };
        customer: Customer;
    }>;
} 