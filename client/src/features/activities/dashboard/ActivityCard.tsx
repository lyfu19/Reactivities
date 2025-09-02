import { AccessTime, Place } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "react-router";
import { formatDate } from "../../../lib/util/util";
import AvatarPopover from "../../../app/shared/components/AvatarPopover";

type Prop = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Prop) {
  const label = activity.isHost ? "You are hosting" : "You are going";
  const color = activity.isHost
    ? "secondary"
    : activity.isGoing
    ? "warning"
    : "default";

  return (
    <Card elevation={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <CardHeader
          avatar={
            <Avatar
              src={activity.hostImageUrl}
              alt="Image of host"
              sx={{ height: 80, width: 80 }}
            />
          }
          title={activity.title}
          slotProps={{ title: { fontSize: 20, fontWeight: "bold" } }}
          subheader={
            <>
              Hosted by{" "}
              <Link to={`/profiles/${activity.hostId}`}>
                {activity.hostDisplayName}
              </Link>
            </>
          }
        />
        <Box display="flex" flexDirection="column" gap={2} mr={2}>
          {(activity.isHost || activity.isGoing) && (
            <Chip
              label={label}
              variant="outlined"
              color={color}
              sx={{ borderRadius: 2 }}
            />
          )}
          {activity.isCancelled && (
            <Chip label="Cancelled" color="error" sx={{ borderRadius: 2 }} />
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <CardContent sx={{ p: 0 }}>
        <Box display="flex" alignItems="center" mb={2} px={2}>
          <Box display="flex" flexGrow={0} alignItems="center">
            <AccessTime sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {formatDate(activity.date)}
            </Typography>
          </Box>
          <Place sx={{ ml: 3, mr: 1 }} />
          <Typography variant="body2">{activity.venue}</Typography>
        </Box>
        <Divider />
        <Box
          display="flex"
          gap={2}
          sx={{ backgroundColor: "grey.200", py: 3, pl: 3 }}
        >
          {activity.attendees.map((attendee) => (
            <AvatarPopover profile={attendee} key={attendee.id} />
          ))}
        </Box>
      </CardContent>

      <CardContent sx={{ pb: 2 }}>
        <Typography variant="body2">{activity.description}</Typography>
        <Button
          component={Link}
          to={`/activities/${activity.id}`}
          size="medium"
          variant="contained"
          sx={{ display: "flex", justifySelf: "self-end", borderRadius: 2 }}
          onClick={() => {}}
        >
          View
        </Button>
      </CardContent>
    </Card>
  );
}
