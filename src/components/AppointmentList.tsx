import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatDateRange } from 'utils/date';
import { Button, Grid, makeStyles, Paper, TextField } from '@material-ui/core';
import { Delete, Edit, Search } from '@material-ui/icons';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import axios from '../../axios';
import { getAppointments } from 'store/appointments';
import Popup from './Popup';
import AppointmentForm from './AppointmentForm';
import SuccessIndicator from './SuccessIndicator';
import { Availability } from '.prisma/client';

const useStyles = makeStyles((theme) => ({
  header: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '2rem',
    textAlign: 'center',
  },
  slotCard: { display: 'flex', flexDirection: 'column', padding: 15 },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionBtn: {
    marginRight: 10,
    padding: 5,
    color: '#CCCCCC',
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
    borderRadius: 0,
    '&:hover': {
      color: '#7B7B7B',
      backgroundColor: 'transparent',
      borderColor: '#7B7B7B',
    },
  },
}));

const AppointmentList = ({
  appointments = [],
  practitioners = [],
  patients = [],
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState<string>('');
  // This popup is for the editing form.
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  // Title for the popup which will wrap the editing form.
  const [popupTitle, setPopupTitle] = useState<string>('Edit Appointment');
  const [appointmentToEdit, setAppointmentToEdit] = useState<any>(null);
  // Initial List of availabilities for the appointment to edit, however this will be changed in the form
  // if the practitioner changes.
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number>(null);

  // Feedback about the possible actions.
  const [showSuccessMesage, setShowSuccessMessage] = useState<boolean>(false);
  const [successText, setSuccessText] = useState<string>('');

  // If appointments change due to an edit or delete action, show an indicator with the appropriate message.
  useEffect(() => {
    if (appointmentToEdit || appointmentToDelete) {
      setShowSuccessMessage(true);
      setOpenPopup(false);
    }
  }, [appointments]);

  useEffect(() => {
    if (!openPopup && !openDeleteDialog) {
      setAppointmentToEdit(null);
      setAppointmentToDelete(null);
    }
  }, [openPopup, openDeleteDialog]);

  const confirmationMessage =
    'Are you sure you want to delete this appointment?';

  const getPractitionerName = (practitionerId: number) => {
    const currentPractitioner = practitioners?.find(
      (practitioner) => practitioner.id === practitionerId,
    );

    return currentPractitioner
      ? `${currentPractitioner?.firstName} ${currentPractitioner?.lastName}`
      : '';
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    if (!value || value.trim() === '') {
      setSearchValue('');
    } else {
      setSearchValue(value.toLowerCase());
    }
  };

  const setAppointmentToEditData = async (appointment) => {
    const { data: currentAvailabilities } = await axios.post(
      `availabilities?practitionerId=${appointment.practitionerId}`,
    );
    setAppointmentToEdit(appointment);

    setAvailabilities(currentAvailabilities);
    setOpenPopup(true);
    setSuccessText('Appointment details edited successfully');
  };

  const setAppointmentToDeleteId = (id: number) => {
    setAppointmentToDelete(id);
    setOpenDeleteDialog(true);
    setSuccessText('Appointment deleted successfully');
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/appointments?appointmentId=${appointmentToDelete}`);
      dispatch(getAppointments());
      setOpenDeleteDialog(false);
    } catch {}
  };

  const handleSuccessClose = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSuccessMessage(false);
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <i>
            <u>
              <h2 className={classes.header}>Appointments List</h2>
            </u>
          </i>
        </Grid>
        <Grid item xs={12}>
          <div>
            <Grid container spacing={1}>
              <Grid item style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Search />
              </Grid>
              <Grid item>
                <TextField
                  id="input-with-icon-grid"
                  label="Search"
                  onChange={handleSearchInput}
                />
              </Grid>
            </Grid>
          </div>
        </Grid>
        {/* As our search is implemented on client side because we have all records (not paginated),
            either we don't have a search value so we display all appointments, or there is a search value,
            so we search for appointments having data related to it.
            For Ids we search for an Id starting with the entered value for better experience & less unrelated
            results, also we parse it to string to be able to apply the startsWith method.
            For strings we compare both search value & data in lowercase for better user experience & ease of use,
            also we use the includes method which searches for the value in any position inside the string to reach
            the needed result easier.
        */}
        {appointments?.map((appointment, index) =>
          !searchValue ||
          appointment.patientId.toString().startsWith(searchValue) ||
          appointment.practitionerId.toString().startsWith(searchValue) ||
          getPractitionerName(appointment.practitionerId)
            .toLowerCase()
            .includes(searchValue) ||
          formatDateRange({
            from: new Date(appointment.startDate),
            to: new Date(appointment.endDate),
          }).includes(searchValue) ? (
            <Grid item xs={12} sm={6} key={`appointment-${appointment.id}`}>
              <Paper elevation={3}>
                <div className={classes.slotCard}>
                  <div>
                    <b>Patient ID: </b>
                    <span>{appointment.patientId}</span>
                  </div>
                  <div>
                    <b>Practitioner ID: </b>
                    <span>{appointment.practitionerId}</span>
                  </div>
                  <div>
                    <b>Practitioner Name: </b>
                    <span>
                      {getPractitionerName(appointment.practitionerId)}
                    </span>
                  </div>
                  <div>
                    <b>Time: </b>
                    <span>
                      {formatDateRange({
                        from: new Date(appointment.startDate),
                        to: new Date(appointment.endDate),
                      })}
                    </span>
                  </div>

                  <div className={classes.actionsContainer}>
                    <Button
                      className={classes.actionBtn}
                      startIcon={<Edit />}
                      // Setting the appointment data to be available on the Form to be edited.
                      onClick={() => {
                        setAppointmentToEditData({ ...appointment, index });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      className={classes.actionBtn}
                      startIcon={<Delete />}
                      onClick={() => setAppointmentToDeleteId(appointment?.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Paper>
            </Grid>
          ) : null,
        )}
      </Grid>
      <Popup
        title={popupTitle}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <AppointmentForm
          patients={patients}
          practitioners={practitioners}
          appointmentToEdit={appointmentToEdit}
          initialAvailabilities={availabilities}
          setOpenPopup={setOpenPopup}
        />
      </Popup>
      <SuccessIndicator
        showSuccessMesage={showSuccessMesage}
        handleSuccessClose={handleSuccessClose}
        successText={successText}
      />
      <DeleteConfirmationDialog
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        confirmationMessage={confirmationMessage}
        handleAction={handleDelete}
      />
    </>
  );
};

export default AppointmentList;
