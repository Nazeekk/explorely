import ExampleService from '../../services/example';

// 1. Створюємо Mock (імітацію) репозиторію
const mockRepository = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
} as any;

describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(() => {
    jest.clearAllMocks(); // Чистимо моки перед кожним тестом
    service = new ExampleService(mockRepository);
  });

  it('should create a new example record', async () => {
    const inputData = {
      example_id: 1,
      example_varchar: 'test',
      example_decimal: 10.5,
    };

    // Налаштовуємо мок: коли викличуть create, поверни inputData
    mockRepository.create.mockResolvedValue(inputData);

    const result = await service.create(inputData);

    expect(result).toEqual(inputData);
    expect(mockRepository.create).toHaveBeenCalledWith(inputData);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should throw error if example not found', async () => {
    // Налаштовуємо мок: повернути null
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.getById(999)).rejects.toThrow('Example not found');
  });
});
