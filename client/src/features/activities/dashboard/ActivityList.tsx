import { Box, Typography } from "@mui/material";
import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import ListMessage from "../../../app/shared/components/ListMessage";
import { observer } from "mobx-react-lite";

const ActivityList = observer(() => {
  const {
    activitiesGroup,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useActivities();
  const { ref, inView } = useInView({
    rootMargin: "0px 0px 50% 0px",
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (!activitiesGroup) {
    return <Typography>No activities found</Typography>;
  }

  const activities = activitiesGroup.pages.flatMap((page) => page.items);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      <div ref={ref} style={{ height: 1 }} />
      {isFetchingNextPage && <ListMessage>Loading more...</ListMessage>}
      {!hasNextPage && <ListMessage>🎉 No more activities</ListMessage>}
    </Box>
  );
});
export default ActivityList;
