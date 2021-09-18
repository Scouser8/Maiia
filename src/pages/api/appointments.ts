import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'prisma/client';

interface Appointment {
  patientId: string;
  practitionerId: string;
  startDate: string;
  endDate: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      const appointments = await prisma.appointment.findMany();
      res.status(200).json(appointments);
      break;
    case 'POST':
      const { patientId, practitionerId, startDate, endDate } = req.body;
      const appointment = await prisma.appointment.create({
        data: {
          patientId: parseInt(patientId),
          practitionerId: parseInt(practitionerId),
          startDate: startDate,
          endDate: endDate,
        },
      });
      res.status(200).json(appointment);
      break;
    case 'PUT':
      const {
        patientId: patientToEdit,
        practitionerId: practitionerToEdit,
        startDate: startDateToEdit,
        endDate: endDateToEdit,
      }: Appointment = req.body;

      try {
        const appointmentToEdit = await prisma.appointment.update({
          where: { id: Number(req.query.appointmentId) },
          data: {
            patientId: parseInt(patientToEdit),
            practitionerId: parseInt(practitionerToEdit),
            startDate: startDateToEdit,
            endDate: endDateToEdit,
          },
        });
        res.status(201).json(appointmentToEdit);
      } catch {
        res.status(404).json(req.body);
      }
      break;

    case 'DELETE':
      try {
        await prisma.appointment.delete({
          where: { id: Number(req.query.appointmentId) },
        });
        res.status(200).json('Deleted');
      } catch {
        res.status(404).json(req.body);
      }
      break;
  }
};
