import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

/**
 * Interface for the properties stored in a generic model.
 */
export interface ModelProps {
	id?: number;
}

/**
 * A base Model class that defines structure for database models.
 * This abstract class is intended to be extended with specific tables/entities.
 * Provides placeholder methods for create, read, update, and delete (CRUD).
 */
export default class Model {
	constructor(
		private sql: postgres.Sql<any>,
		public props: ModelProps,
	) {}

	/**
	 * Creates a new model entry in the database.
	 * Should be overridden in child classes to include specific fields.
	 * @param sql PostgreSQL connection instance.
	 * @param props Data to insert.
	 * @returns A new Model instance.
	 */
	static async create(
		sql: postgres.Sql<any>,
		props: ModelProps,
	): Promise<Model> {
		return new Model(sql, {});
	}

	/**
	 * Reads a single record from the database by ID.
	 * @param sql PostgreSQL connection instance.
	 * @param id ID of the record to fetch.
	 * @returns A populated Model instance.
	 */
	static async read(sql: postgres.Sql<any>, id: number): Promise<Model> {
		return new Model(sql, {});
	}

	/**
	 * Reads all records from the database.
	 * @param sql PostgreSQL connection instance.
	 * @returns Array of all Model instances.
	 */
	static async readAll(sql: postgres.Sql<any>): Promise<Model[]> {
		return [new Model(sql, {})];
	}

	/**
	 * Updates the current record with new data.
	 * Should be overridden in child classes to specify allowed fields.
	 * @param updateProps Key-value pairs of fields to update.
	 */
	async update(updateProps: Partial<ModelProps>) {}

	/**
	 * Deletes the current record from the database.
	 * Should be overridden in child classes.
	 */
	async delete() {}
}
