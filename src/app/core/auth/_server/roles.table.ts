export class RolesTable {
	public static roles: any = [
        {
            id: 1,
            uid: 'cEw56UEJPrX2868GQC4C',
            title: 'Administrator',
            isCoreRole: true,
            permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        {
            id: 2,
            uid: 'iKuAfqpxWfXrOceCBBMs',
            title: 'Manager',
            isCoreRole: false,
			permissions: [3, 4, 10]
        },
        {
            id: 3,
            uid: 'nCc5zZDlFXA1UoxEbqD1',
            title: 'Guest',
            isCoreRole: false,
			permissions: []
        }
    ];
}
