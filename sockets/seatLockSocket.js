const SeatLock = require('../models/seatLockModel');
const AppError = require('../utils/AppError');

const LOCK_TTL_MS = process.env.LOCK_TTL_MS
  ? Number(process.env.LOCK_TTL_MS)
  : 2 * 60 * 1000;

const eventRoom = (eventId) => `event_${eventId}`;

const emitError = (socket, seatId, reason) => {
  socket.emit('seat_lock_failed', { seatId, reason });
};

module.exports = function setupSeatLockSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.id;

    socket.on('join_event_room', (eventId) => {
      if (!eventId) return;
      socket.join(eventRoom(eventId));
    });

    socket.on('leave_event_room', (eventId) => {
      if (!eventId) return;
      socket.leave(eventRoom(eventId));
    });

    socket.on('request_initial_locks', async ({ eventId }) => {
      if (!eventId) return;

      try {
        const activeLocks = await SeatLock.find({
          eventId,
          expiresAt: { $gt: new Date() },
        }).lean();

        socket.emit('initial_locks', {
          locks: activeLocks.map(({ seatId, lockedBy, expiresAt }) => ({
            seatId,
            lockedBy,
            expiresAt,
          })),
        });
      } catch (err) {
        console.error(
          new AppError('Failed to fetch initial seat locks', 500),
          err
        );
      }
    });

    socket.on('lock_seat', async ({ eventId, seatId }) => {
      if (!eventId || !seatId) {
        return emitError(socket, seatId, 'invalid_payload');
      }

      const now = new Date();
      const expiresAt = new Date(Date.now() + LOCK_TTL_MS);

      try {
        const filter = {
          eventId,
          seatId,
          $or: [
            { expiresAt: { $lte: now } },
            { expiresAt: { $exists: false } },
            { lockedBy: userId },
          ],
        };

        const update = {
          eventId,
          seatId,
          lockedBy: userId,
          createdAt: now,
          expiresAt,
        };

        const lock = await SeatLock.findOneAndUpdate(filter, update, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }).lean();

        if (!lock) {
          return emitError(socket, seatId, 'already_locked');
        }

        io.to(eventRoom(eventId)).emit('seat_locked', {
          seatId,
          lockedBy: userId,
          expiresAt,
        });

        socket.emit('seat_lock_success', { seatId, expiresAt });
      } catch (err) {
        console.error(new AppError('Seat lock failed', 500), err);
        emitError(socket, seatId, 'server_error');
      }
    });

    socket.on('unlock_seat', async ({ eventId, seatId }) => {
      if (!eventId || !seatId) return;

      try {
        const result = await SeatLock.deleteOne({
          eventId,
          seatId,
          lockedBy: userId,
        });

        if (!result.deletedCount) {
          return emitError(socket, seatId, 'not_owner');
        }

        io.to(eventRoom(eventId)).emit('seat_unlocked', { seatId });
        socket.emit('seat_unlocked_ack', { seatId });
      } catch (err) {
        console.error(new AppError('Seat unlock failed', 500), err);
      }
    });

    socket.on('refresh_lock', async ({ eventId, seatId }) => {
      if (!eventId || !seatId) return;

      const expiresAt = new Date(Date.now() + LOCK_TTL_MS);

      try {
        const lock = await SeatLock.findOneAndUpdate(
          { eventId, seatId, lockedBy: userId },
          { expiresAt },
          { new: true }
        ).lean();

        if (!lock) {
          return emitError(socket, seatId, 'not_owner_or_expired');
        }

        io.to(eventRoom(eventId)).emit('seat_lock_refreshed', {
          seatId,
          expiresAt,
        });

        socket.emit('seat_lock_refreshed_ack', {
          seatId,
          expiresAt,
        });
      } catch (err) {
        console.error(new AppError('Seat refresh failed', 500), err);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const locks = await SeatLock.find({ lockedBy: userId }).lean();

        if (!locks.length) return;

        await SeatLock.deleteMany({ lockedBy: userId });

        locks.forEach(({ eventId, seatId }) => {
          io.to(eventRoom(eventId)).emit('seat_unlocked', { seatId });
        });
      } catch (err) {
        console.error(
          new AppError('Socket disconnect cleanup failed', 500),
          err
        );
      }
    });
  });
};
