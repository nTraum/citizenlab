import { loadModules } from 'utils/moduleUtils';

import projectFoldersConfiguration from './project_folders';
import smartGroupsConfiguration from './smart_groups';
import granularPermissionsConfiguration from './granular_permissions';
import moderationConfiguration from './moderation';
import idBosaFasConfiguration from './id_bosa_fas';
import idCowConfiguration from './id_cow';
import idBogusConfiguration from './id_bogus';
import idIdCardLookupConfiguration from './id_id_card_lookup';
import IdFraneConnectConfiguration from './id_franceconnect';

import googleTagManagerConfiguration from './google_tag_manager';
import googleAnalyticsConfiguration from './google_analytics';
import intercomConfiguration from './intercom';
import satismeterConfiguration from './satismeter';
import segmentConfiguration from './segment';

export default loadModules([
  {
    configuration: projectFoldersConfiguration,
    isEnabled: true,
  },
  {
    configuration: smartGroupsConfiguration,
    isEnabled: true,
  },
  {
    configuration: googleTagManagerConfiguration,
    isEnabled: true,
  },
  {
    configuration: googleAnalyticsConfiguration,
    isEnabled: true,
  },
  {
    configuration: intercomConfiguration,
    isEnabled: true,
  },
  {
    configuration: satismeterConfiguration,
    isEnabled: true,
  },
  {
    configuration: segmentConfiguration,
    isEnabled: true,
  },
  {
    configuration: granularPermissionsConfiguration,
    isEnabled: true,
  },
  {
    configuration: moderationConfiguration,
    isEnabled: true,
  },
  {
    configuration: idBosaFasConfiguration,
    isEnabled: true,
  },
  {
    configuration: idCowConfiguration,
    isEnabled: true,
  },
  {
    configuration: idBogusConfiguration,
    isEnabled: true,
  },
  {
    configuration: idIdCardLookupConfiguration,
    isEnabled: true,
  },
  {
    configuration: IdFraneConnectConfiguration,
    isEnabled: true,
  },
]);
