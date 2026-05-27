import db from "../db.js";

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT s.*, u.full_name as provider_name 
      FROM services s
      JOIN users u ON s.provider_id = u.id
    `);
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const [service] = await db.query(`
      SELECT s.*, u.full_name as provider_name 
      FROM services s
      JOIN users u ON s.provider_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (service.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.json({ success: true, data: service[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Provider
export const createService = async (req, res) => {
  try {
    const { title, description, price, category, image_url } = req.body;
    
    // provider_id comes from the logged in user via protect middleware
    const provider_id = req.user.id;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: "Title and price are required." });
    }

    const [result] = await db.query(
      "INSERT INTO services (provider_id, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [provider_id, title, description, price, category, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider
export const updateService = async (req, res) => {
  try {
    const { title, description, price, category, image_url } = req.body;
    const provider_id = req.user.id;

    // Verify service belongs to user
    const [service] = await db.query("SELECT * FROM services WHERE id = ?", [req.params.id]);
    
    if (service.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    
    if (service[0].provider_id !== provider_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to update this service" });
    }

    await db.query(
      "UPDATE services SET title = COALESCE(?, title), description = COALESCE(?, description), price = COALESCE(?, price), category = COALESCE(?, category), image_url = COALESCE(?, image_url) WHERE id = ?",
      [title, description, price, category, image_url, req.params.id]
    );

    res.json({
      success: true,
      message: "Service updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Provider
export const deleteService = async (req, res) => {
  try {
    const provider_id = req.user.id;

    // Verify service belongs to user
    const [service] = await db.query("SELECT * FROM services WHERE id = ?", [req.params.id]);
    
    if (service.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    
    if (service[0].provider_id !== provider_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to delete this service" });
    }

    await db.query("DELETE FROM services WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
