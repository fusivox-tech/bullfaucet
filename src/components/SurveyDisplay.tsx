import CpxSurveyWeb from './CpxSurveyWeb';

// Define prop types
interface SurveyProps {
  appId: string;
  userId: string | null;
  onSurveyLoad?: () => void;
}

export const FullContentSurvey = ({ appId, userId, onSurveyLoad }: SurveyProps) => (
  <div style={{ height: 400, margin: 10 }}>
    <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
      Available Surveys
    </h3>
    <CpxSurveyWeb 
      appId={appId} 
      userId={userId} 
      surveyStyle={1} 
      onLoad={onSurveyLoad} 
    />
  </div>
);

export const SidebarSurvey = ({ appId, userId, onSurveyLoad }: SurveyProps) => (
  <div style={{ height: 200, margin: 10 }}>
    <CpxSurveyWeb 
      appId={appId} 
      userId={userId} 
      surveyStyle={2} 
      onLoad={onSurveyLoad} 
    />
  </div>
);

export const SingleSurvey = ({ appId, userId, onSurveyLoad }: SurveyProps) => (
  <div style={{ height: 100, margin: 10 }}>
    <CpxSurveyWeb 
      appId={appId} 
      userId={userId} 
      surveyStyle={3} 
      onLoad={onSurveyLoad} 
    />
  </div>
);