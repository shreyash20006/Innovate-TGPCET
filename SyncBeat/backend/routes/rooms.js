const express = require('express');
const { body, param, validationResult } = require('express-validator');

/**
 * Room CRUD routes
 * All routes require Supabase RLS — service key used server-side only
 */
module.exports = function roomRoutes(supabase) {
  const router = express.Router();

  function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }

  // GET /api/rooms/:code — fetch room by code
  router.get('/:code',
    param('code').isAlphanumeric().isLength({ min: 6, max: 6 }),
    validate,
    async (req, res) => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', req.params.code.toUpperCase())
        .single();
      if (error || !data) return res.status(404).json({ error: 'Room not found' });
      res.json(data);
    }
  );

  // POST /api/rooms — create room
  router.post('/',
    body('code').isAlphanumeric().isLength({ min: 6, max: 6 }),
    body('name').isString().isLength({ min: 1, max: 60 }),
    body('created_by').isUUID(),
    validate,
    async (req, res) => {
      const { code, name, created_by } = req.body;
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code: code.toUpperCase(), name, created_by })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    }
  );

  // DELETE /api/rooms/:code — delete room (only by owner)
  router.delete('/:code',
    param('code').isAlphanumeric().isLength({ min: 6, max: 6 }),
    body('user_id').isUUID(),
    validate,
    async (req, res) => {
      const { user_id } = req.body;
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('code', req.params.code.toUpperCase())
        .eq('created_by', user_id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ deleted: true });
    }
  );

  // GET /api/rooms/:code/history — last 50 messages
  router.get('/:code/history',
    param('code').isAlphanumeric().isLength({ min: 6, max: 6 }),
    validate,
    async (req, res) => {
      // first get room id
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', req.params.code.toUpperCase())
        .single();
      if (!room) return res.status(404).json({ error: 'Room not found' });

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return res.status(400).json({ error: error.message });
      res.json(data.reverse());
    }
  );

  return router;
};
