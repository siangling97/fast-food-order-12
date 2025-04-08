const knex = require("../db/connection");

function list(date) {
  console.log("🔍 Fetching reservations for date:", date);

  const query = knex("reservations")
    .select("*")
    .whereNot({ "status": "finished" });

  if (date) {
    query.where({ "reservation_date": date }).orderBy("reservation_time");
  }

  return query.then((reservations) => {
    // ✅ Convert `reservation_date` to `YYYY-MM-DD` format before returning
    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      reservation_date: reservation.reservation_date.toISOString().split("T")[0], // Removes Time/UTC
    }));

    console.log("📌 Fixed Database Query Result:", formattedReservations);
    return formattedReservations;
  });
}

function create(newReservation) {
  return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then(createdRecords => createdRecords[0]);
}

function read(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ "reservation_id": reservation_id })
    .first();
}

function update(updatedReservation) {
  return knex("reservations")
    .select("*")
    .where({ "reservation_id": updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then(updatedRecords => updatedRecords[0]);
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  create,
  list,
  read,
  update,
  search,
};