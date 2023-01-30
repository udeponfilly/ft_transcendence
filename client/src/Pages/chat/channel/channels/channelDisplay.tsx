import * as React from 'react';
import ShowChannelItems from './channelCategory';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';


let channelCategories = [
  {
    type: 'dm', 
    name: 'Private messages',
    panel: 'panel1',
    index: 0,
  }, 
  {
    type: 'joined', 
    name: 'Joined Channels',
    panel: 'panel2',
    index: 1,
  }, 
  {
    type: 'all', 
    name: 'All Channels',
    panel: 'panel3',
    index: 2,
  }, 
]

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function ChannelDisplay(props: any) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

	return (
		<div>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="DM" {...a11yProps(0)} />
            <Tab label="Joined" {...a11yProps(1)} />
            <Tab label="All" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <div className="channelsDisplay">
				{channelCategories.map((category) => (
          <TabPanel value={value} index={category.index} key={category.index}>
            {category.type === 'dm' ? ShowChannelItems('dm', props) : null}
            {category.type === 'joined' ? ShowChannelItems('joined', props) : null}
            {category.type === 'all' ? ShowChannelItems('all', props) : null}
          </TabPanel>
				))}
        </div>
		</div>
	)
}