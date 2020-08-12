// @flow strict
import * as React from 'react';
import { Link } from 'react-router';

import { getIdFromGRN } from 'logic/permissions/GRN';
import Routes from 'routing/Routes';
import type { GranteesList } from 'logic/permissions/EntityShareState';
import SharedEntity from 'logic/permissions/SharedEntity';

type Props = {
  capabilityTitle: string,
  sharedEntity: SharedEntity,
};

const _getOwnerLink = ({ type, id }) => {
  const ownerId = getIdFromGRN(id, type);

  switch (type) {
    case 'user':
      return Routes.SYSTEM.USERS.show(ownerId);
    case 'team':
      return Routes.pluginRoute('SYSTEM_TEAMS_TEAMID')(ownerId);
    default:
      throw new Error(`Owner of entity has not supported type: ${type}`);
  }
};

const OwnersCell = ({ owners }: {owners: GranteesList}) => (
  <td className="limited">
    {owners.map((owner, index) => {
      const link = _getOwnerLink(owner);
      const isLast = index >= owners.size - 1;

      return (
        <React.Fragment key={owner.id}>
          <Link to={link}>{owner.title}</Link>
          {!isLast && ', '}
        </React.Fragment>
      );
    })}
  </td>
);

const SharedEntitiesOverviewItem = ({
  capabilityTitle,
  sharedEntity: {
    owners,
    title,
    type,
  },
}: Props) => (
  <tr key={title + type}>
    <td className="limited">{title}</td>
    <td className="limited">{type}</td>
    <OwnersCell owners={owners} />
    <td className="limited">{capabilityTitle}</td>
  </tr>
);

export default SharedEntitiesOverviewItem;
