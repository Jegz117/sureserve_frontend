import db from "../db.js";

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { service_id, booking_date, booking_time, notes } = req.body;
    const buyer_id = req.user.id; // From protect middleware

    if (!service_id || !booking_date || !booking_time) {
      return res.status(400).json({ success: false, message: "Service ID, Date, and Time are required." });
    }

    const [result] = await db.query(
      "INSERT INTO bookings (buyer_id, service_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?)",
      [buyer_id, service_id, booking_date, booking_time, notes || null]
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user/provider bookings
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    let query = "";
    let queryParams = [];

    if (req.user.role === 'provider') {
      // Get bookings for services owned by this provider
      query = `
        SELECT b.*, s.title as service_title, u.full_name as buyer_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u ON b.buyer_id = u.id
        WHERE s.provider_id = ?
      `;
      queryParams = [userId];
    } else {
      // Get bookings made by this buyer
      query = `
        SELECT b.*, s.title as service_title, u.full_name as provider_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u ON s.provider_id = u.id
        WHERE b.buyer_id = ?
      `;
      queryParams = [userId];
    }

    const [bookings] = await db.query(query, queryParams);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Provider
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const provider_id = req.user.id;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
       return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // Check if the booking exists and belongs to the provider's service
    const [booking] = await db.query(`
      SELECT b.*, s.provider_id
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (booking.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking[0].provider_id !== provider_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to update this booking" });
    }

    await db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id]);

    res.json({ success: true, message: "Booking status updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
