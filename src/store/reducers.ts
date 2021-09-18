import appointments from './appointments';
import practitioners from './practitioners';
import availabilities from './availabilities';
import patients from './patients';
import timeslots from './timeslots';

export default {
  appointments: appointments.reducer,
  practitioners: practitioners.reducer,
  availabilities: availabilities.reducer,
  patients: patients.reducer,
  timeslots: timeslots.reducer,
};
